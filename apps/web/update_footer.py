import re

with open('app/(marketing)/layout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'(<div>\s*<h4 className="font-semibold text-gray-900 mb-4">Product</h4>.*?</div>)'

replacement = r'''\1
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><Link href="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
              </ul>
            </div>'''

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('app/(marketing)/layout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
