"use client";

import { useState } from "react";
import { X, Check, Plus } from "lucide-react";

interface SearchConsoleSite {
  siteUrl: string;
  permissionLevel: string;
  domain: string;
  isExisting: boolean;
}

interface AddSitesModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: SearchConsoleSite[];
  onAddSites: (selectedDomains: string[]) => void;
  isLoading: boolean;
}

export function AddSitesModal({ isOpen, onClose, sites, onAddSites, isLoading }: AddSitesModalProps) {
  const [selectedSites, setSelectedSites] = useState<Set<string>>(new Set());

  const handleToggleSite = (domain: string) => {
    const newSelected = new Set(selectedSites);
    if (newSelected.has(domain)) {
      newSelected.delete(domain);
    } else {
      newSelected.add(domain);
    }
    setSelectedSites(newSelected);
  };

  const handleAddSelected = () => {
    onAddSites(Array.from(selectedSites));
    setSelectedSites(new Set());
  };

  const handleSelectAll = () => {
    const newSites = sites.filter(site => !site.isExisting).map(site => site.domain);
    setSelectedSites(new Set(newSites));
  };

  const handleDeselectAll = () => {
    setSelectedSites(new Set());
  };

  const newSites = sites.filter(site => !site.isExisting);
  const existingSites = sites.filter(site => site.isExisting);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Add Sites from Search Console</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* New Sites Section */}
          {newSites.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-white">
                  Available Sites ({newSites.length})
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="text-sm text-neutral-400 hover:text-neutral-300 transition-colors"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                {newSites.map((site) => (
                  <div
                    key={site.domain}
                    className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg border border-neutral-700"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedSites.has(site.domain)}
                        onChange={() => handleToggleSite(site.domain)}
                        className="w-4 h-4 text-blue-600 bg-neutral-700 border-neutral-600 rounded focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-white font-medium">{site.domain}</div>
                        <div className="text-sm text-neutral-400">
                          Permission: {site.permissionLevel}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-green-400">
                      <Plus size={16} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing Sites Section */}
          {existingSites.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-white mb-3">
                Already Added ({existingSites.length})
              </h3>
              <div className="space-y-2">
                {existingSites.map((site) => (
                  <div
                    key={site.domain}
                    className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg border border-neutral-700 opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <Check size={16} className="text-green-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{site.domain}</div>
                        <div className="text-sm text-neutral-400">
                          Permission: {site.permissionLevel}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-green-400">
                      Added
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {newSites.length === 0 && existingSites.length === 0 && (
            <div className="text-center py-8">
              <div className="text-neutral-400">No sites found in Search Console</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
          <div className="text-sm text-neutral-400">
            {selectedSites.size} site(s) selected
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSelected}
              disabled={selectedSites.size === 0 || isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isLoading ? "Adding..." : `Add ${selectedSites.size} Site(s)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
