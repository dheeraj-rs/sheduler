import { useState } from 'react';
import Modal from './Modal';
import { Plus } from 'lucide-react';
import { HeaderSettingsModalProps, TableHeader } from '../../types/scheduler';

export default function HeaderSettingsModal({ 
  isOpen, 
  onClose, 
  headers, 
  onSave,
}: HeaderSettingsModalProps) {
  const [localHeaders, setLocalHeaders] = useState<TableHeader[]>(headers);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHeader, setNewHeader] = useState<Partial<TableHeader>>({
    label: '',
    type: 'name',
    isVisible: true
  });
  const [editingHeaderId, setEditingHeaderId] = useState<string | null>(null);

  const handleVisibilityChange = (id: string) => {
    setLocalHeaders(prev => 
      prev.map(header => 
        header.id === id 
          ? { ...header, isVisible: !header.isVisible }
          : header
      )
    );
  };

  const handleAddHeader = () => {
    if (!newHeader.label) return;

    const newHeaderComplete: TableHeader = {
      id: `header-${Date.now()}`,
      label: newHeader.label,
      type: newHeader.type as TableHeader['type'],
      isVisible: true
    };

    setLocalHeaders(prev => [...prev, newHeaderComplete]);
    setNewHeader({ label: '', type: 'name', isVisible: true });
    setShowAddForm(false);
  };

  const handleHeaderNameUpdate = (id: string, newLabel: string) => {
    setLocalHeaders(prev =>
      prev.map(header =>
        header.id === id
          ? { ...header, label: newLabel }
          : header
      )
    );
    setEditingHeaderId(null);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, id: string, label: string) => {
    if (e.key === 'Enter') {
      handleHeaderNameUpdate(id, label);
    } else if (e.key === 'Escape') {
      setEditingHeaderId(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Table Header Settings">
      <div className="space-y-4">
        <div className="max-h-[400px] overflow-y-auto">
          {localHeaders.map((header) => (
            <div
              key={header.id}
              className="flex items-center gap-3 p-2 bg-white border rounded-lg mb-2"
            >
              <input
                type="checkbox"
                checked={header.isVisible}
                onChange={() => handleVisibilityChange(header.id)}
                className="rounded border-gray-300"
              />
              
              {editingHeaderId === header.id ? (
                <input
                  type="text"
                  value={header.label}
                  onChange={(e) => handleHeaderNameUpdate(header.id, e.target.value)}
                  onBlur={() => setEditingHeaderId(null)}
                  onKeyDown={(e) => handleEditKeyDown(e, header.id, header.label)}
                  autoFocus
                  className="flex-1 text-sm font-medium text-gray-700 border rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                />
              ) : (
                <span 
                  className="flex-1 text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600"
                  onClick={() => setEditingHeaderId(header.id)}
                >
                  {header.label}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Add Header Form */}
        {showAddForm ? (
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Header Label
                </label>
                <input
                  type="text"
                  value={newHeader.label}
                  onChange={(e) => setNewHeader({ ...newHeader, label: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter header label"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Header Type
                </label>
                <select
                  value={newHeader.type}
                  onChange={(e) => setNewHeader({ ...newHeader, type: e.target.value as TableHeader['type'] })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="name">Name</option>
                  <option value="time">Time</option>
                  <option value="speaker">Speaker</option>
                  <option value="role">Role</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddHeader}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Header
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add New Header
          </button>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(localHeaders);
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
} 