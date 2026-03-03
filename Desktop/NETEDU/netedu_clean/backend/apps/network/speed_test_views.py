"""
apps/network/speed_test_views.py
─────────────────────────────────
Backend endpoints that the browser speed test talks to.

  GET  /api/network/ping/           → tiny response for latency measurement
  GET  /api/network/download-test/  → stream random bytes for download test
  POST /api/network/upload-test/    → accept uploaded bytes for upload test

These are the server-side of the NDT7-inspired speed measurement system.
"""

import os
from django.http import HttpResponse, StreamingHttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ping(request):
    """
    Tiny endpoint for latency measurement.
    Returns minimal data so the round-trip time = pure network latency.
    """
    return Response({'pong': True}, headers={
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_test(request):
    """
    Streams random bytes to the browser for download speed measurement.
    size param controls how many bytes per response (default 500KB).

    We use StreamingHttpResponse so Django doesn't buffer the whole
    thing in memory — important for large payloads.
    """
    size = min(int(request.GET.get('size', 500_000)), 2_000_000)  # cap at 2MB

    def generate_random_bytes():
        chunk_size = 65_536  # 64KB chunks
        remaining = size
        while remaining > 0:
            to_send = min(chunk_size, remaining)
            yield os.urandom(to_send)
            remaining -= to_send

    response = StreamingHttpResponse(
        generate_random_bytes(),
        content_type='application/octet-stream',
    )
    response['Content-Length'] = str(size)
    response['Cache-Control'] = 'no-store'
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_test(request):
    """
    Accepts uploaded bytes and immediately discards them.
    The browser measures how fast it could send the data.
    We just need to ACK receipt — we don't store anything.
    """
    # Read and discard the uploaded data
    # (request.FILES contains the 'data' blob)
    total_bytes = 0
    if 'data' in request.FILES:
        f = request.FILES['data']
        for chunk in f.chunks():
            total_bytes += len(chunk)

    return Response({
        'received_bytes': total_bytes,
        'status': 'ok'
    }, headers={'Cache-Control': 'no-store'})
