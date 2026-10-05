import re

with open('app/admin/domains/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# I will replace everything from:
# <div className="p-8 space-y-10">
# to:
#           <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">

replacement = '''<div className="p-8 space-y-10">
            {verifyError && (
              <div className="bg-red-50 text-red-700 p-4 rounded-md text-sm border border-red-100 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 shrink-0" /> {verifyError}
              </div>
            )}

            {/* 1. Domain Verification */}
            <section>
              <div className="mb-4">
                <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span> 
                  Domain Verification
                </h4>
                <p className="text-sm text-gray-500 ml-8 mt-1">Proves you own this domain. Add this TXT record to your DNS settings.</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden ml-8">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider">
                    <tr><th className="px-5 py-3 font-medium">Type</th><th className="px-5 py-3 font-medium">Name / Host</th><th className="px-5 py-3 font-medium">Value / Content</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-800 font-mono text-sm">
                    <tr className="group hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">TXT</td>
                      <td className="px-5 py-4">@</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-between gap-4">
                          <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 break-all">mailflow-verification={verifyDomain.id}</span>
                          <button onClick={() => handleCopy("mailflow-verification=" + verifyDomain.id)} className="text-gray-400 hover:text-gray-900 transition-colors bg-white border border-gray-200 rounded p-1.5 shadow-sm" title="Copy">
                            {copiedText === "mailflow-verification=" + verifyDomain.id ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 2. Mail Routing (MX) */}
            <section>
              <div className="mb-4">
                <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span> 
                  Email Routing (MX Records)
                </h4>
                <p className="text-sm text-gray-500 ml-8 mt-1">Directs incoming emails for your domain to MailFlow servers.</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden ml-8">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider">
                    <tr><th className="px-5 py-3 font-medium">Type</th><th className="px-5 py-3 font-medium">Name / Host</th><th className="px-5 py-3 font-medium">Value / Mail Server</th><th className="px-5 py-3 font-medium">Priority</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-800 font-mono text-sm">
                    <tr className="group hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">MX</td>
                      <td className="px-5 py-4">@</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-between gap-4">
                          <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">mx.mailflow.dev</span>
                          <button onClick={() => handleCopy("mx.mailflow.dev")} className="text-gray-400 hover:text-gray-900 transition-colors bg-white border border-gray-200 rounded p-1.5 shadow-sm" title="Copy">
                            {copiedText === "mx.mailflow.dev" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4">10</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 3. Spam Protection (SPF & DKIM) */}
            <section>
              <div className="mb-4">
                <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span> 
                  Spam Protection (SPF & DKIM)
                </h4>
                <p className="text-sm text-gray-500 ml-8 mt-1">Authenticates your emails so they don't land in the recipient's spam folder.</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden ml-8">
                <table className="min-w-full text-sm text-left table-fixed">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider">
                    <tr><th className="px-5 py-3 font-medium w-24">Type</th><th className="px-5 py-3 font-medium w-1/3">Name / Host</th><th className="px-5 py-3 font-medium">Value / Content</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-800 font-mono text-sm">
                    <tr className="group hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">TXT</td>
                      <td className="px-5 py-4 truncate" title="@">@</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-between gap-4">
                          <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 break-all">v=spf1 include:_spf.mailflow.dev ~all</span>
                          <button onClick={() => handleCopy("v=spf1 include:_spf.mailflow.dev ~all")} className="text-gray-400 hover:text-gray-900 transition-colors bg-white border border-gray-200 rounded p-1.5 shadow-sm shrink-0" title="Copy">
                            {copiedText === "v=spf1 include:_spf.mailflow.dev ~all" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr className="group hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">TXT</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate" title="mailflow._domainkey">mailflow._domainkey</span>
                          <button onClick={() => handleCopy("mailflow._domainkey")} className="text-gray-400 hover:text-gray-900 transition-colors bg-white border border-gray-200 rounded p-1.5 shadow-sm shrink-0" title="Copy Name">
                            {copiedText === "mailflow._domainkey" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-between gap-4">
                          <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 break-all">v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1...</span>
                          <button onClick={() => handleCopy("v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1...")} className="text-gray-400 hover:text-gray-900 transition-colors bg-white border border-gray-200 rounded p-1.5 shadow-sm shrink-0" title="Copy Value">
                            {copiedText === "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1..." ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>'''

import re
content = re.sub(r'<div className="p-8 space-y-10">.*?</section>\s*</div>', replacement + '\n          </div>', content, flags=re.DOTALL)

with open('app/admin/domains/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
