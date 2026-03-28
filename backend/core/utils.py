def detect_video_provider(url):
    """
    Detects the video provider based on the URL.
    Returns: 'youtube', 'vimeo', 'cloudinary', or None
    """
    if not url:
        return None
        
    url_lower = url.lower()
    
    if 'youtube.com' in url_lower or 'youtu.be' in url_lower:
        return 'youtube'
    
    if 'vimeo.com' in url_lower:
        return 'vimeo'
    
    if 'res.cloudinary.com' in url_lower:
        return 'cloudinary'
        
    return None
