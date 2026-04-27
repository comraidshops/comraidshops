# Updated API URL to ap.comraidshops.art
import sys
import os

# Point to your virtualenv's site-packages
INTERP = "/home/comrtcgw/virtualenv/api/3.9/bin/python"
if sys.executable != INTERP:
    os.execl(INTERP, INTERP, *sys.argv)

# Ensure the project root is in the python path
sys.path.append(os.getcwd())

# Set environment variable for Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# This is the entry point that Phusion Passenger (cPanel) looks for
from config.wsgi import application
