'use client';

import React, { useState } from 'react';
import { Template } from '../types';
import { api } from '../lib/api';
import { Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface TemplateManagerProps {
  templates: Template[];
  onTemplatesChanged: () => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  templates,
  onTemplatesChanged
}) => {
  const [name, setName] = useState('');
  const [version, setVersion] = useState('');
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [makeActive, setMakeActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!templateFile) {
      setMessage({ type: 'error', text: 'Please select a template image file (PNG, JPG).' });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('version', version);
      formData.append('makeActive', String(makeActive));
      formData.append('templateImage', templateFile);

      const res = await api.uploadTemplate(formData);
      if (res.success) {
        setMessage({ type: 'success', text: `Template version ${version} uploaded successfully!` });
        setName('');
        setVersion('');
        setTemplateFile(null);
        onTemplatesChanged();
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to upload template.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network failure during upload.' });
    } finally {
      setUploading(false);
    }
  };

  const handleActivate = async (id: string, ver: string) => {
    try {
      const res = await api.activateTemplate(id);
      if (res.success) {
        setMessage({ type: 'success', text: `Template version ${ver} is now active!` });
        onTemplatesChanged();
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to activate template.' });
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Upload Box */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Upload Template Version
        </h3>
        <form onSubmit={handleUpload} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Template Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Spheronix Tech Standard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Version Tag *
            </label>
            <input
              type="text"
              placeholder="e.g. 2.0"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Template Image *
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={(e) => setTemplateFile(e.target.files?.[0] || null)}
              required
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
            />
          </div>

          <div className="sm:col-span-3 flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={makeActive}
                onChange={(e) => setMakeActive(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="font-semibold text-slate-700">
                Immediately activate this version
              </span>
            </label>

            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Register Template</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Templates List */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          All Template Versions
        </h3>
        <div className="divide-y divide-slate-100">
          {templates.map((tpl) => (
            <div
              key={tpl._id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                    tpl.isActive
                      ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500/30'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  v{tpl.version}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{tpl.name}</span>
                    {tpl.isActive && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Added: {new Date(tpl.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                {!tpl.isActive ? (
                  <button
                    type="button"
                    onClick={() => handleActivate(tpl._id, tpl.version)}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                  >
                    Activate
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    In Production
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
