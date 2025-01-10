import React, { useState, useMemo } from 'react';
import { PlusCircle, ChevronRight, Check, X, Combine, Settings } from 'lucide-react';
import { Section, MergedFields, SectionListProps, TableHeader, SelectionState, SectionRowProps } from '../../types/scheduler';
import { groupSectionsByRole } from '../../utils/sectionUtils';
import Modal from '../Modal/Modal';
import SectionForm from './SectionForm';
import ColorSelectionModal from '../Modal/ColorSelectionModal';
import HeaderSettingsModal from '../Modal/HeaderSettingsModal';



const sectionLevelColors = {
  0: 'hover:bg-blue-50 border-l-4 border-l-blue-500',
  1: 'hover:bg-purple-50 border-l-4 border-l-purple-500',
  2: 'hover:bg-green-50 border-l-4 border-l-green-500',
  3: 'hover:bg-orange-50 border-l-4 border-l-orange-500',
  4: 'hover:bg-pink-50 border-l-4 border-l-pink-500',
};

function SectionRow({
  section,
  level = 0,
  showSpeakerRole = true,
  onAddSubsection,
  onUpdateSection,
  selection,
  onSelect
}: SectionRowProps) {
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const isColumnSelected = (columnType: keyof MergedFields) => {
    return selection?.selectedColumns.some(
      col => col.sectionId === section.id && col.columnType === columnType
    );
  };

  const handleColumnClick = (sectionId: string, columnType: keyof MergedFields) => {
    if (!selection?.isSelecting || !onSelect) return;
    onSelect(sectionId, columnType);
  };

  const getLevelColor = (level: number) => {
    return sectionLevelColors[level as keyof typeof sectionLevelColors] || sectionLevelColors[0];
  };

  const renderActionButtons = (section: Section) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onAddSubsection?.(section.id)}
        className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded"
      >
        Add Sub
      </button>
      <button
        onClick={() => setEditingSection(section)}
        className="text-green-600 hover:text-green-800 px-2 py-1 rounded"
      >
        Edit
      </button>
      <button
        onClick={() => onUpdateSection(section.id, { deleted: true })}
        className="text-red-600 hover:text-red-800 px-2 py-1 rounded"
      >
        Delete
      </button>
    </div>
  );

  const getColumnClassName = (columnType: keyof MergedFields) => {
    const baseClasses = 'px-4 py-2 border-b border-r text-sm cursor-pointer';
    const hoverClass = selection?.isSelecting ? 'hover:bg-gray-100' : '';
    const selectedClass = isColumnSelected(columnType) ? selection?.selectedColor : '';
    const mergedClass = section.mergedFields?.[columnType] && section.mergedFields?.color ? section.mergedFields.color : '';
    
    return `${baseClasses} ${hoverClass} ${selectedClass} ${mergedClass}`;
  };

  return (
    <>
      <tr className={getLevelColor(level)}>
        <td 
          className={getColumnClassName('timeSlot')}
          onClick={() => handleColumnClick(section.id, 'timeSlot')}
        >
          <div className="flex items-center gap-1" style={{ paddingLeft: `${level * 1}rem` }}>
            {level > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
            <span className="whitespace-nowrap">
              {section.timeSlot.start} - {section.timeSlot.end}
            </span>
          </div>
        </td>
        <td 
          className={getColumnClassName('name')}
          onClick={() => handleColumnClick(section.id, 'name')}
        >
          {section.name}
        </td>
        {showSpeakerRole && (
          <>
            <td 
              className={getColumnClassName('speaker')}
              onClick={() => handleColumnClick(section.id, 'speaker')}
            >
              {section.speaker}
            </td>
            <td 
              className={getColumnClassName('role')}
              onClick={() => handleColumnClick(section.id, 'role')}
            >
              {section.role}
            </td>
          </>
        )}
        <td className="px-4 py-2 border-b text-sm">
          {!selection?.isSelecting && renderActionButtons(section)}
        </td>
      </tr>

      {section.subsections?.map((subsection) => (
        <SectionRow
          key={subsection.id}
          section={subsection}
          level={level + 1}
          showSpeakerRole={showSpeakerRole}
          onAddSubsection={onAddSubsection}
          onUpdateSection={onUpdateSection}
          selection={selection}
          onSelect={onSelect}
        />
      ))}

      {editingSection && (
        <Modal
          isOpen={true}
          onClose={() => setEditingSection(null)}
          title={`Edit ${editingSection.name}`}
        >
          <SectionForm
            onSubmit={(updates) => {
              onUpdateSection(editingSection.id, updates);
              setEditingSection(null);
            }}
            initialData={editingSection}
            isSubsection={level > 0}
          />
        </Modal>
      )}
    </>
  );
}

export default function SectionList({
  sections,
  onAddSection,
  onUpdateSection,
  onAddSubsection
}: SectionListProps) {
  const groupedSections = groupSectionsByRole(sections);
  const [selection, setSelection] = useState<SelectionState>({
    isSelecting: false,
    selectedColumns: [],
    selectedColor: 'bg-blue-100'
  });
  const [showColorModal, setShowColorModal] = useState(false);
  const [showHeaderSettings, setShowHeaderSettings] = useState(false);
  const [headers, setHeaders] = useState<TableHeader[]>([
    { id: '1', label: 'Time', type: 'time', isVisible: true },
    { id: '2', label: 'Section', type: 'name', isVisible: true },
    { id: '3', label: 'Speaker', type: 'speaker', isVisible: true },
    { id: '4', label: 'Role', type: 'role', isVisible: true },
    { id: '5', label: 'Actions', type: 'actions', isVisible: true },
  ]);

  const handleSelect = (sectionId: string, columnType: keyof MergedFields) => {
    setSelection(prev => {
      const existingSelection = prev.selectedColumns.find(
        col => col.sectionId === sectionId && col.columnType === columnType
      );

      return {
        ...prev,
        selectedColumns: existingSelection
          ? prev.selectedColumns.filter(col => 
              !(col.sectionId === sectionId && col.columnType === columnType)
            )
          : [...prev.selectedColumns, { sectionId, columnType }]
      };
    });
  };

  const handleApplySelection = (color: string, mergeName: string) => {
    // Get all unique section IDs that are part of any column group
    const allSelectedSectionIds = [...new Set(
      selection.selectedColumns.map(col => col.sectionId)
    )];

    // For each section that's part of the selection
    allSelectedSectionIds.forEach(sectionId => {
      const selectedColumns = selection.selectedColumns
        .filter(col => col.sectionId === sectionId)
        .map(col => col.columnType);

      const mergedFields: Partial<MergedFields> = {
        speaker: false,
        role: false,
        timeSlot: false
      };
      selectedColumns.forEach(columnType => {
        (mergedFields[columnType] as boolean) = true;
      });
      mergedFields.color = color;
      mergedFields.name = mergeName;

      onUpdateSection(sectionId, {
        mergedFields
      });
    });

    setSelection({
      isSelecting: false,
      selectedColumns: [],
      selectedColor: 'bg-blue-100'
    });
  };

  const tableHeaders = useMemo(() => (
    headers
      .filter(header => header.isVisible)
      .map(header => (
        <th 
          key={header.id}
          className="px-4 py-2 border-b border-r text-left text-sm font-semibold text-gray-600"
        >
          {header.label}
        </th>
      ))
  ), [headers]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center sticky top-0 bg-gray-50 z-10 py-4">
        <h3 className="text-xl font-semibold text-gray-900">Sections</h3>
        <div className="flex items-center gap-2 h-10">
          {selection.isSelecting ? (
            <>
              <button
                onClick={() => setShowColorModal(true)}
                className="inline-flex items-center justify-center gap-1.5 h-10 px-4 min-w-[100px] bg-emerald-500 text-white rounded-lg shadow-sm transition-all duration-200 hover:bg-emerald-600 hover:shadow-md active:transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
              >
                <Check className="w-4 h-4 stroke-[2.5] flex-shrink-0" />
                <span className="font-medium">Apply</span>
              </button>
              
              <button
                onClick={() => setSelection({
                  isSelecting: false,
                  selectedColumns: [],
                  selectedColor: 'bg-blue-100'
                })}
                className="inline-flex items-center justify-center gap-1.5 h-10 px-4 min-w-[100px] bg-gray-100 text-gray-700 rounded-lg shadow-sm transition-all duration-200 hover:bg-gray-200 hover:shadow-md active:transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              >
                <X className="w-4 h-4 stroke-[2.5] flex-shrink-0" />
                <span className="font-medium">Cancel</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setSelection(prev => ({ ...prev, isSelecting: true }))}
                className="inline-flex items-center justify-center h-10 w-10 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                title="Enable Column Merging"
              >
                <Combine className="w-5 h-5" />
              </button>
              <button
                onClick={onAddSection}
                className="inline-flex items-center justify-center gap-1.5 h-10 px-4 min-w-[130px] bg-blue-600 text-white rounded-lg shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md active:transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              >
                <PlusCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">Add Section</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => setShowHeaderSettings(true)}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <Settings className="w-4 h-4" />
          Customize Headers
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 bg-white">
          <thead>
            <tr className="bg-gray-50">
              {tableHeaders}
            </tr>
          </thead>
          <tbody>
            {groupedSections.map((group, groupIndex) => (
              <React.Fragment key={groupIndex}>
                {group.sections.map((section, sectionIndex) => (
                  <SectionRow
                    key={section.id}
                    section={section}
                    showSpeakerRole={sectionIndex === 0}
                    speaker={section.speaker}
                    role={section.role}
                    rowSpan={group.sections.length}
                    onAddSubsection={onAddSubsection}
                    onUpdateSection={onUpdateSection}
                    selection={selection}
                    onSelect={handleSelect}
                  />
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {showColorModal && (
        <ColorSelectionModal
          isOpen={showColorModal}
          onClose={() => setShowColorModal(false)}
          onApply={handleApplySelection}
        />
      )}
      {showHeaderSettings && (
        <HeaderSettingsModal
          isOpen={showHeaderSettings}
          onClose={() => setShowHeaderSettings(false)}
          headers={headers}
          onSave={setHeaders}
        />
      )}
    </div>
  );
}