import re

with open('app/admin/users/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add createdUser state
content = content.replace("const [submitting, setSubmitting] = useState(false);", "const [submitting, setSubmitting] = useState(false);\n  const [createdUser, setCreatedUser] = useState<{email: string, password: string} | null>(null);\n  const [copied, setCopied] = useState(false);")

# 2. Modify handleAddUser
pattern1 = r'await fetchApi\(\'/api/admin/v1/users\', \{.*?\n\s+setIsModalOpen\(false\);\n\s+setFirstName\(""\); setLastName\(""\); setUsername\(""\); setPassword\(""\);\n\s+await loadUsers\(\);'
replacement1 = '''await fetchApi('/api/admin/v1/users', {
        method: "POST",
        body: JSON.stringify({
          email: email,
          first_name: firstName,
          last_name: lastName,
          password: password,
          role: role,
        }),
      });
      setCreatedUser({ email, password });
      await loadUsers();'''
content = re.sub(r'await fetchApi\(\'/api/admin/v1/users\', \{.*?\}\);\s*setIsModalOpen\(false\);\s*setFirstName\(""\); setLastName\(""\); setUsername\(""\); setPassword\(""\);\s*await loadUsers\(\);', replacement1, content, flags=re.DOTALL)

# 3. Modify the modal rendering
pattern2 = r'(<div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">.*?)(<div className="flex-1 overflow-y-auto">)(.*?)(\s*</form>\s*</div>\s*<div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">.*?</div>)'

replacement2 = r'''\1
              {createdUser ? (
                <div className="p-8 flex flex-col items-center justify-center text-center animate-fade-in">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">User Created Successfully!</h3>
                  <p className="text-gray-500 text-sm mb-6 max-w-sm">Please copy the temporary password below and send it to the user securely. For security reasons, you won't be able to see it again.</p>
                  
                  <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-5 text-left space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1.5">Email Address</p>
                      <p className="text-sm font-medium text-gray-900 bg-white border border-gray-200 px-3 py-2 rounded">{createdUser.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1.5">Temporary Password</p>
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-sm font-mono text-gray-900 bg-white px-3 py-2 rounded border border-gray-200 flex-1 overflow-hidden text-ellipsis">{createdUser.password}</code>
                        <button type="button" onClick={() => { navigator.clipboard.writeText(createdUser.password); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-blue-600 hover:text-blue-700 px-3 py-2 hover:bg-blue-50 rounded border border-transparent transition-colors flex items-center gap-1.5 text-sm font-medium shrink-0">
                          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                          {copied ? <span className="text-green-600">Copied!</span> : "Copy"}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full pt-8">
                    <button type="button" onClick={() => { setIsModalOpen(false); setTimeout(() => { setCreatedUser(null); setFirstName(""); setLastName(""); setUsername(""); setPassword(""); setCopied(false); }, 300); }} className="w-full px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm">
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  \2\3\4
                </>
              )}'''

content = re.sub(pattern2, replacement2, content, flags=re.DOTALL)

with open('app/admin/users/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
