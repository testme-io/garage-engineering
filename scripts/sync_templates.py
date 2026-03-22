import json
import os
import xml.etree.ElementTree
import zipfile
from xml.dom import minidom

# Base paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIBRARY_PATH = os.path.join(BASE_DIR, 'library.json')
# Files in scripts folder
XML_NAME = 'User.xml'
TEMP_XML_PATH = os.path.join(BASE_DIR, 'scripts', XML_NAME)
OUTPUT_ZIP = os.path.join(BASE_DIR, 'scripts', 'settings.zip')


def prettify(elem):
    """Formats XML for better readability"""
    rough_string = xml.etree.ElementTree.tostring(elem, 'utf-8')
    reparsed = minidom.parseString(rough_string)
    return reparsed.toprettyxml(indent="  ")


def generate_assets():
    if not os.path.exists(LIBRARY_PATH):
        print(f"Error: {LIBRARY_PATH} not found")
        return

    with open(LIBRARY_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 1. Create Live Templates tree
    template_set = xml.etree.ElementTree.Element('templateSet', {'group': 'User'})

    for item in data.get('shortcodes', []):
        prefix = item.get('prefix')
        template_val = item.get('template')
        if not prefix or not template_val:
            continue

        template = xml.etree.ElementTree.SubElement(template_set, 'template', {
            'name': prefix,
            'value': template_val,
            'description': f"Tag: {item.get('tag', 'custom')}",
            'toReformat': 'true',
            'toShortenFQNames': 'true'
        })

        context = xml.etree.ElementTree.SubElement(template, 'context')
        xml.etree.ElementTree.SubElement(context, 'option', {'name': 'OTHER', 'value': 'true'})

    # 2. Save temporary XML file
    xml_data = prettify(template_set)
    with open(TEMP_XML_PATH, 'w', encoding='utf-8') as f:
        f.write(xml_data)

    # 3. Pack into ZIP with IDE settings marker
    with zipfile.ZipFile(OUTPUT_ZIP, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Mandatory marker file for PyCharm import
        zipf.writestr('IntelliJ IDEA Global Settings', '')

        # Templates file in the correct directory structure
        zipf.write(TEMP_XML_PATH, arcname=os.path.join('templates', XML_NAME))

    # 4. Remove temporary file
    if os.path.exists(TEMP_XML_PATH):
        os.remove(TEMP_XML_PATH)

    print(f"--- SUCCESS ---")
    print(f"Created: {OUTPUT_ZIP}")
    print(f"Instruction: Try 'File | Manage IDE Settings | Import Settings' again.")


if __name__ == "__main__":
    generate_assets()