"""
Serves B2-stored documents through a stable app URL that never goes
stale — see app/services/b2_service.py for why the bucket is private
and why this redirect-on-every-visit approach was chosen over a plain
public link.
"""
import logging
import re

from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse

from app.services import b2_service

logger = logging.getLogger(__name__)

router = APIRouter()

# Strips CR/LF and other control characters so untrusted path input can't
# forge fake log lines or inject control sequences into log output.
_LOG_UNSAFE_CHARS = re.compile(r"[\r\n\t\x00-\x1f\x7f]")


def _sanitize_for_log(value: str) -> str:
    return _LOG_UNSAFE_CHARS.sub("", value)[:200]


@router.get("/files/b2/{file_key:path}")
async def view_b2_file(file_key: str):
    """
    Redirects (307) to a presigned B2 URL generated at request time.
    `file_key` uses the `:path` converter so it can contain the "/" in
    e.g. "sales_invoices/1234_invoice.pdf".
    """
    if not b2_service.b2_configured():
        raise HTTPException(status_code=404, detail="File storage not configured")

    try:
        signed_url = b2_service.generate_presigned_url(file_key, expires_in=3600)
    except Exception as e:
        logger.warning(
            "Failed to generate presigned URL for %s: %s",
            _sanitize_for_log(file_key),
            e,
        )
        raise HTTPException(status_code=404, detail="File not found")

    return RedirectResponse(url=signed_url, status_code=307)
