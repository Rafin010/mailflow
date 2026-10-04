import bleach

# Define allowed HTML tags and attributes for emails
ALLOWED_TAGS = [
    'a', 'b', 'blockquote', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3',
    'h4', 'h5', 'h6', 'hr', 'i', 'img', 'li', 'ol', 'p', 'pre', 'span',
    'strong', 'ul'
]

ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title', 'target'],
    'img': ['src', 'alt', 'width', 'height'],
    '*': ['class', 'style']
}

def sanitize_html(html_content: str) -> str:
    """
    Sanitize raw HTML content to prevent XSS attacks before saving or rendering.
    """
    if not html_content:
        return ""
    
    clean_html = bleach.clean(
        html_content,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        strip=True
    )
    return clean_html
