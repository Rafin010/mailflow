import re

with open('app/admin/users/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add createPortal import
content = content.replace('import { useEffect, useState } from "react";', 'import { useEffect, useState } from "react";\nimport { createPortal } from "react-dom";')

# Add mounted state
mounted_str = "  const [mounted, setMounted] = useState(false);\n  useEffect(() => { setMounted(true); }, []);\n"
content = content.replace("const [isModalOpen, setIsModalOpen] = useState(false);", "const [isModalOpen, setIsModalOpen] = useState(false);\n" + mounted_str)

# Replace the modal rendering
pattern = r'\{isModalOpen && \(\s*<div className="fixed inset-0 z-\[9999\] flex items-center justify-center bg-black/50 p-4">'
replacement = r'''{isModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">'''

content = re.sub(pattern, replacement, content)

# Add closing paren for createPortal
content = content.replace("        </div>\n      )}\n    </div>", "        </div>\n      ), document.body)}\n    </div>")

with open('app/admin/users/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
