export interface TimeSlot {
  readonly start: string;
  readonly end: string;
}

export interface MergedFields {
  speaker: boolean;
  role: boolean;
  timeSlot: boolean;
  color?: string;
  name?: string;
}

export interface Section {
  readonly id: string;
  name: string;
  timeSlot: TimeSlot;
  speaker: string;
  role: string;
  subsections: Section[];
  mergedFields?: Partial<MergedFields>;
  deleted?: boolean;
}

export interface Track {
  id: string;
  name: string;
  sections: Section[];
}

export interface TrackListProps {
  tracks: Track[];
  onAddTrack: (track: Partial<Track>) => void;
  onSelectTrack: (trackId: string) => void;
}

export interface TrackItemProps {
  track: Track;
  onSelect: () => void;
  colorIndex: number;
}

export interface TrackFormProps {
  onSubmit: (track: Partial<Track>) => void;
  initialData?: Track;
}


export interface SelectionState {
  isSelecting: boolean;
  selectedColumns: {
    sectionId: string;
    columnType: keyof MergedFields;
  }[];
  selectedColor: string;
}

export interface SectionListProps {
  sections: Section[];
  onAddSection: () => void;
  onUpdateSection: (sectionId: string, updates: Partial<Section>) => void;
  onAddSubsection?: (sectionId: string) => void;
}

export interface SectionRowProps {
  section: Section;
  level?: number;
  showSpeakerRole?: boolean;
  speaker?: string;
  role?: string;
  rowSpan?: number;
  onAddSubsection?: (sectionId: string) => void;
  onUpdateSection: (sectionId: string, updates: Partial<Section>) => void;
  selection?: SelectionState;
  onSelect?: (sectionId: string, columnType: keyof MergedFields) => void;
}

export interface TableHeader {
  id: string;
  label: string;
  type: 'time' | 'name' | 'speaker' | 'role' | 'actions';
  isVisible: boolean;
}

export interface SectionItemProps {
  section: Section;
  onUpdate: (updates: Partial<Section>) => void;
  onDelete: () => void;
  onAddSubsection: (parentId: string) => void;
  level?: number;
}

export interface SectionFormProps {
  onSubmit: (section: Partial<Section>) => void;
  initialData?: Section;
  isSubsection?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}



export interface TableHeader {
  id: string;
  label: string;
  type: 'time' | 'name' | 'speaker' | 'role' | 'actions';
  isVisible: boolean;
}

export interface HeaderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  headers: TableHeader[];
  onSave: (headers: TableHeader[]) => void;
}

export interface ColorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (color: string, name: string) => void;
}




export type Tracks = Track[];