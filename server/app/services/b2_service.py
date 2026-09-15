"""
Backblaze B2 object storage (via its S3-compatible API, through boto3).

Why this exists: the previous storage backend, Google Drive, requires an
OAuth app that's stuck in Google Cloud Console's "Testing" publishing
status, and Testing-mode refresh tokens silently expire every 7 days —
see the SCOPES comment in drive_service.py for the full explanation.
That's what caused previously-working file links to stop opening after
about a week. B2 authenticates with a static Application Key ID +
Application Key instead of an OAuth consent flow, so there's no
timed expiry to trip over.

The bucket is kept PRIVATE (not Public) on purpose: Backblaze requires a
verified payment method on the account before it will let you flip a
bucket to Public, even though B2 itself is free up to 10GB. Instead,
files are read back via short-lived presigned URLs minted fresh on every
request (see generate_presigned_url + app/routes/files.py) — from the
user's perspective a document link just always works, since a brand new
URL is generated every single time it's opened, rather than one static
link that could eventually go stale.

Setup (one-time, in the Backblaze B2 dashboard):
  1. Create a bucket. Leave "Files in Bucket are" set to Private — no
     payment method needed for that.
  2. Create an Application Key scoped to that bucket (App Keys page).
  3. Copy these into your environment:
       B2_APPLICATION_KEY_ID   -> the key's "keyID"
       B2_APPLICATION_KEY      -> the key's "applicationKey" (shown once)
       B2_BUCKET_NAME          -> the bucket name
       B2_ENDPOINT_URL         -> bucket page's "Endpoint" (S3 compatible)
"""
import asyncio
import logging

from app.config import settings

logger = logging.getLogger(__name__)

_client = None


def b2_configured() -> bool:
    """True only if every setting B2 needs is present."""
    return bool(
        settings.B2_APPLICATION_KEY_ID
        and settings.B2_APPLICATION_KEY
        and settings.B2_BUCKET_NAME
        and settings.B2_ENDPOINT_URL
    )


def _get_client():
    """
    Lazily builds (and caches) the boto3 S3 client pointed at B2's
    endpoint. Lazy + cached so boto3 is only imported/instantiated when
    B2 is actually configured and used — mirrors how DriveService only
    builds its client on demand.
    """
    global _client
    if _client is None:
        import boto3
        from botocore.client import Config as BotoConfig

        _client = boto3.client(
            "s3",
            endpoint_url=settings.B2_ENDPOINT_URL,
            aws_access_key_id=settings.B2_APPLICATION_KEY_ID,
            aws_secret_access_key=settings.B2_APPLICATION_KEY,
            config=BotoConfig(signature_version="s3v4"),
        )
    return _client


async def upload_file(file_bytes: bytes, key: str, mime_type: str) -> None:
    """
    Uploads `file_bytes` to the configured (private) bucket under `key`
    (e.g. "sales_invoices/1234_invoice.pdf"). Doesn't return a URL —
    unlike a Public bucket, a private object has no plain URL that just
    works; callers should build the app's own /api/v1/files/b2/{key}
    link instead (see file_storage_service.py), which mints a presigned
    URL on demand each time it's opened.
    """
    client = _get_client()

    def _put():
        client.put_object(
            Bucket=settings.B2_BUCKET_NAME,
            Key=key,
            Body=file_bytes,
            ContentType=mime_type or "application/octet-stream",
        )

    # put_object is a blocking network call — run it off the event loop
    # the same way file_storage_service.py already does for local disk
    # writes, so one slow upload doesn't stall every other request.
    await asyncio.to_thread(_put)


def generate_presigned_url(key: str, expires_in: int = 3600) -> str:
    """
    Returns a temporary signed download URL for `key`, valid for
    `expires_in` seconds (default 1 hour). Called fresh on every request
    to /api/v1/files/b2/{key} (see app/routes/files.py) rather than
    once at upload time — that's what makes the document link the user
    clicks always work, even though any single presigned URL expires.
    """
    client = _get_client()
    return client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.B2_BUCKET_NAME, "Key": key},
        ExpiresIn=expires_in,
    )
