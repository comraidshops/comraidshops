from PIL import Image

def create_icon(size, padding=20):
    # Open the logo
    logo = Image.open('logo-white.png')
    logo = logo.convert("RGBA")
    
    # Calculate target logo size inside the icon (with padding)
    target_width = size - (padding * 2)
    target_height = size - (padding * 2)
    
    # Resize logo to fit within the target dimensions while maintaining aspect ratio
    logo.thumbnail((target_width, target_height), Image.Resampling.LANCZOS)
    
    # Create black background
    icon = Image.new('RGBA', (size, size), (0, 0, 0, 255))
    
    # Calculate position to paste the logo
    paste_x = (size - logo.width) // 2
    paste_y = (size - logo.height) // 2
    
    # Paste the logo
    icon.paste(logo, (paste_x, paste_y), logo)
    
    # Save the icon
    filename = f'icon-{size}x{size}.png'
    icon.save(filename, 'PNG')
    print(f'Generated {filename}')

if __name__ == '__main__':
    create_icon(192, padding=32)
    create_icon(512, padding=84)
