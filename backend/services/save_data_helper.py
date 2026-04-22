import sys
import os
import json
from datetime import datetime

# We will use the browser tool for actual scraping, but this script will manage the state and file writing.
# Since I am an AI, I can't easily run a "script" that uses the browser tool directly in one go if it requires multiple turns.
# Instead, I will use the browser tool to gather data and then use this script to save it.

def save_item(category, filename, data):
    base_dir = '/Users/macbook/Desktop/comraidshops/data'
    cat_dir = os.path.join(base_dir, category)
    os.makedirs(cat_dir, exist_ok=True)
    
    # Save JSON
    json_path = os.path.join(cat_dir, f"{filename}.json")
    with open(json_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    # Save TXT (formatted)
    txt_path = os.path.join(cat_dir, f"{filename}.txt")
    with open(txt_path, 'w') as f:
        f.write(f"Category: {category.capitalize()}\n")
        f.write(f"Title: {data.get('title', data.get('name', 'Untitled'))}\n")
        f.write(f"URL: {data.get('url', 'N/A')}\n")
        f.write("-" * 40 + "\n\n")
        f.write(data.get('content', data.get('description', 'No content available.')))
        f.write("\n\n" + "-" * 40 + "\n")
        f.write(f"Backup Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        if 'images' in data:
            f.write("\nImages:\n")
            for img in data['images']:
                f.write(f"- {img}\n")

if __name__ == "__main__":
    # This is a helper for the assistant to call
    if len(sys.argv) < 4:
        print("Usage: python3 save_data.py <category> <filename> <data_file_path>")
        sys.exit(1)
    
    category = sys.argv[1]
    filename = sys.argv[2]
    data_file_path = sys.argv[3]
    
    with open(data_file_path, 'r') as f:
        data = json.load(f)
        
    save_item(category, filename, data)
