"use client";

import { useState, useEffect } from "react";
import { Plus, Globe, CheckCircle2, AlertTriangle, MoreVertical, X, ShieldAlert, ArrowRight, Loader2, Copy, Check } from "lucide-react";
import { fetchApi } from "@/lib/api";

interface Domain {
  id: string;
  domain_name: string;
  is_verified: boolean;
  mx_status: "ok" | "missing" | "invalid";
  spf_status: "ok" | "missing" | "invalid";
  dkim_status: "ok" | "missing" | "invalid";
}

export default function Domains() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifyDomain, setVerifyDomain] = useState<Domain | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      const data = await fetchApi("/api/admin/v1/domains");
      setDomains(data);
    } catch (err: any) {
      setError(err.message || "Failed to load domains");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    setIsSubmitting(true);
    setError("");
    
    try {
      const added = await fetchApi("/api/admin/v1/domains", {
        method: "POST",
        body: JSON.stringify({ domain_name: newDomain.toLowerCase() }),
      });
      setDomains([...domains, added]);
      setNewDomain("");
      setIsAdding(false);
    } catch (err: any) {
      setError(err.message || "Failed to add domain");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading domains...</div>;
  }

  if (verifyDomain) {
    return (
      <div className="animate-fade-in w-full max-w-5xl mx-auto pb-12">
        <div className="mb-6 flex items-center gap-4">
          <button onClick={() => { setVerifyDomain(null); setVerifyError(""); }} className="text-gray-500 hover:text-gray-900 transition-colors bg-white border border-gray-200 rounded-md p-2 shadow-sm hover:bg-gray-50">
            <ArrowRight className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Verify & Setup: {verifyDomain.domain_name}</h1>
            <p className="text-sm text-gray-500 mt-1">Add these DNS records to your DNS provider (e.g. Cloudflare, GoDaddy).</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-8 space-y-10">
            {verifyError && (
              <div className="bg-red-50 text-red-700 p-4 rounded-md text-sm border border-red-100 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 shrink-0" /> {verifyError}
              </div>
            )}

            {/* 1. Domain Verification */}
            <section>
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span> 
                Domain Verification
              </h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-gray-100 border-b border-gray-200 text-gray-600">
                    <tr><th className="px-5 py-3 font-medium">Type</th><th className="px-5 py-3 font-medium">Name / Host</th><th className="px-5 py-3 font-medium">Value / Content</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-800 font-mono text-xs">
                    <tr className="group">
                      <td className="px-5 py-4">TXT</td>
                      <td className="px-5 py-4">@</td>
                      <td className="px-5 py-4 flex items-center justify-between gap-4">
                        <span>mailflow-verification={verifyDomain.id}</span>
                        <button onClick={() => handleCopy("mailflow-verification=" + verifyDomain.id)} className="text-gray-400 hover:text-gray-600 transition-colors" title="Copy">
                          {copiedText === "mailflow-verification=" + verifyDomain.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 2. Mail Routing (MX) */}
            <section>
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span> 
                Email Routing (MX Records)
              </h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-gray-100 border-b border-gray-200 text-gray-600">
                    <tr><th className="px-5 py-3 font-medium">Type</th><th className="px-5 py-3 font-medium">Name / Host</th><th className="px-5 py-3 font-medium">Value / Mail Server</th><th className="px-5 py-3 font-medium">Priority</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-800 font-mono text-xs">
                    <tr className="group">
                      <td className="px-5 py-4">MX</td>
                      <td className="px-5 py-4">@</td>
                      <td className="px-5 py-4 flex items-center justify-between gap-4">
                        <span>mx.mailflow.dev</span>
                        <button onClick={() => handleCopy("mx.mailflow.dev")} className="text-gray-400 hover:text-gray-600 transition-colors" title="Copy">
                          {copiedText === "mx.mailflow.dev" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </td>
                      <td className="px-5 py-4">10</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 3. Spam Protection (SPF & DKIM) */}
            <section>
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span> 
                Spam Protection (SPF & DKIM)
              </h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-gray-100 border-b border-gray-200 text-gray-600">
                    <tr><th className="px-5 py-3 font-medium">Type</th><th className="px-5 py-3 font-medium">Name / Host</th><th className="px-5 py-3 font-medium">Value / Content</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-800 font-mono text-xs">
                    <tr className="group">
                      <td className="px-5 py-4">TXT</td>
                      <td className="px-5 py-4">@</td>
                      <td className="px-5 py-4 flex items-center justify-between gap-4">
                        <span>v=spf1 include:_spf.mailflow.dev ~all</span>
                        <button onClick={() => handleCopy("v=spf1 include:_spf.mailflow.dev ~all")} className="text-gray-400 hover:text-gray-600 transition-colors" title="Copy">
                          {copiedText === "v=spf1 include:_spf.mailflow.dev ~all" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </td>
                    </tr>
                    <tr className="group">
                      <td className="px-5 py-4">TXT</td>
                      <td className="px-5 py-4 flex items-center justify-between gap-4">
                        <span>mailflow._domainkey</span>
                        <button onClick={() => handleCopy("mailflow._domainkey")} className="text-gray-400 hover:text-gray-600 transition-colors" title="Copy">
                          {copiedText === "mailflow._domainkey" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </td>
                      <td className="px-5 py-4 flex items-center justify-between gap-4">
                        <span className="break-all">v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1...</span>
                        <button onClick={() => handleCopy("v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1...")} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0" title="Copy">
                          {copiedText === "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1..." ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <button onClick={() => { setVerifyDomain(null); setVerifyError(""); }} className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 bg-white border border-gray-300 rounded-md transition-colors shadow-sm">
              I'll do this later
            </button>
            <button 
              onClick={async () => {
                setVerifying(true); setVerifyError("");
                try {
                  await fetchApi(`/api/admin/v1/domains/${verifyDomain.id}/verify`, { method: "POST" });
                  setVerifyDomain(null);
                  loadDomains();
                } catch (err: any) {
                  setVerifyError(err.message || "DNS records not detected yet. DNS propagation may take up to 24 hours.");
                } finally {
                  setVerifying(false);
                }
              }}
              disabled={verifying} 
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {verifying ? "Verifying..." : "Done"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Domains</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the custom domains associated with your organization.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Domain
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-6 border border-red-100">
          {error}
        </div>
      )}

      {isAdding && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 animate-fade-in">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Add New Domain</h3>
              <p className="text-sm text-gray-500">Enter the domain name you own. You will need to verify ownership via DNS records.</p>
            </div>
            <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleAddDomain} className="flex gap-3">
            <div className="relative flex-1 max-w-md">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="text" 
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="e.g. yourcompany.com" 
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                autoFocus
                disabled={isSubmitting}
              />
            </div>
            <button 
              type="submit"
              disabled={!newDomain.trim() || isSubmitting}
              className="bg-gray-900 hover:bg-black text-white px-5 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Proceed"}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Domain Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Email Hosting (MX/SPF/DKIM)
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {domains.map((domain) => (
              <tr key={domain.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Globe className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                    <div className="text-sm font-medium text-gray-900">{domain.domain_name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {domain.is_verified ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <AlertTriangle className="h-3.5 w-3.5" /> Pending Verification
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {domain.mx_status === "ok" && domain.spf_status === "ok" && domain.dkim_status === "ok" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Configured
                    </span>
                  ) : (
                    <button onClick={() => setVerifyDomain(domain)} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors">
                      <ShieldAlert className="h-3.5 w-3.5" /> Setup Required
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {!domain.is_verified ? (
                    <button onClick={() => setVerifyDomain(domain)} className="text-blue-600 hover:text-blue-900 flex items-center justify-end gap-1 w-full font-semibold">
                      Verify <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {domains.length === 0 && (
          <div className="p-12 text-center">
            <Globe className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-sm font-medium text-gray-900">No domains added</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a custom domain for your organization.</p>
          </div>
        )}
      </div>

    </div>
  );
}


