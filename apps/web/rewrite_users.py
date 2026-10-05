import re

with open('app/admin/users/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# I will replace the modal container
pattern = r'<div className="fixed inset-0 z-50 overflow-hidden">.*?<div className="fixed inset-y-0 right-0 max-w-md w-full flex">.*?<div className="w-full h-full bg-white shadow-2xl flex flex-col animate-fade-in">'

replacement = '''<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">'''

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Also need to fix the closing tags at the very bottom
pattern2 = r'              </div>\n            </div>\n          </div>\n        </div>\n      \)}\n    </div>\n  \);\n}'
replacement2 = '''              </div>
            </div>
        </div>
      )}
    </div>
  );
}'''

content = re.sub(pattern2, replacement2, content)

with open('app/admin/users/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
