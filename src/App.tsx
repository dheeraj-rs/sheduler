import { useState, lazy, Suspense } from 'react';
import { Track, Section } from './types/scheduler';
import ErrorBoundary from './components/ErrorBoundary';

const TrackList = lazy(() => import('./components/Track/TrackList'));
const SectionList = lazy(() => import('./components/Section/SectionList'));
import Modal from './components/Modal/Modal';
import SectionForm from './components/Section/SectionForm';

function App() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [addingSubsectionFor, setAddingSubsectionFor] = useState<string | null>(null);

  const handleAddTrack = (trackData: Partial<Track>) => {
    const newTrack: Track = {
      id: crypto.randomUUID(),
      name: trackData.name || `Track ${tracks.length + 1}`,
      sections: []
    };
    setTracks(prev => [...prev, newTrack]);
  };

  const handleAddSection = (trackId: string, sectionData: Partial<Section>) => {
    setTracks(prev => prev.map(track => {
      if (track.id !== trackId) return track;
      
      const newSection: Section = {
        id: crypto.randomUUID(),
        name: sectionData.name || `Section ${track.sections.length + 1}`,
        timeSlot: sectionData.timeSlot || { start: '09:00', end: '10:00' },
        speaker: sectionData.speaker || '',
        role: sectionData.role || '',
        subsections: [],
        mergedFields: {
          speaker: false,
          role: false,
          timeSlot: false
        }
      };
      
      return { ...track, sections: [...track.sections, newSection] };
    }));
  };

  const handleAddSubsection = (parentSectionId: string) => {
    setAddingSubsectionFor(parentSectionId);
    setIsAddSectionModalOpen(true);
  };

  const createNewSubsection = (parentSection: Section, sectionData: Partial<Section>): Section => {
    return {
      id: `subsection-${Date.now()}`,
      name: sectionData.name || `Subsection ${parentSection.subsections.length + 1}`,
      timeSlot: sectionData.mergedFields?.timeSlot 
        ? parentSection.timeSlot 
        : (sectionData.timeSlot || { start: '09:00', end: '10:00' }),
      speaker: sectionData.mergedFields?.speaker 
        ? parentSection.speaker 
        : (sectionData.speaker || ''),
      role: sectionData.mergedFields?.role 
        ? parentSection.role 
        : (sectionData.role || ''),
      subsections: [],
      mergedFields: sectionData.mergedFields || {
        speaker: false,
        role: false,
        timeSlot: false
      }
    };
  };

  const handleSubmitSection = (sectionData: Partial<Section>) => {
    if (!selectedTrackId) return;

    if (addingSubsectionFor) {
      setTracks(tracks.map(track => {
        if (track.id !== selectedTrackId) return track;

        const addSubsectionToSection = (sections: Section[]): Section[] => {
          return sections.map(section => {
            if (section.id === addingSubsectionFor) {
              const newSubsection = createNewSubsection(section, sectionData);
              return {
                ...section,
                subsections: [...section.subsections, newSubsection]
              };
            }
            if (section.subsections.length > 0) {
              return {
                ...section,
                subsections: addSubsectionToSection(section.subsections)
              };
            }
            return section;
          });
        };

        return {
          ...track,
          sections: addSubsectionToSection(track.sections)
        };
      }));
      setAddingSubsectionFor(null);
    } else {
      handleAddSection(selectedTrackId, sectionData);
    }
    setIsAddSectionModalOpen(false);
  };

  const handleUpdateSection = (sectionId: string, updates: Partial<Section>) => {
    if (!selectedTrackId) {
      console.warn('No track selected for update');
      return;
    }

    const updatedTracks = tracks.map(track => {
      if (track.id === selectedTrackId) {
        const updateSectionRecursively = (sections: Section[], targetId: string, updates: Partial<Section>): Section[] => {
          return sections.map(section => {
            if (section.id === targetId) {
              return updates.deleted ? null : {
                ...section,
                ...updates,
                subsections: section.subsections,
                mergedFields: { ...section.mergedFields, ...updates.mergedFields }
              };
            }
            
            if (section.subsections?.length) {
              const updatedSubsections = updateSectionRecursively(section.subsections, targetId, updates);
              if (updatedSubsections !== section.subsections) {
                return { ...section, subsections: updatedSubsections };
              }
            }
            return section;
          }).filter((section): section is Section => section !== null);
        };

        const updatedSections = updateSectionRecursively(track.sections, sectionId, updates);
        if (updatedSections === track.sections) {
          console.warn(`Section with ID ${sectionId} not found`);
        }

        return {
          ...track,
          sections: updatedSections
        };
      }
      return track;
    });

    setTracks(updatedTracks);
  };

  const selectedTrack = tracks.find(track => track.id === selectedTrackId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Scientific Scheduler</h1>
          <p className="mt-2 text-gray-600">Manage your program tracks and sessions efficiently</p>
        </header>

        <main className="space-y-8">
          <ErrorBoundary>
            <Suspense fallback={<div>Loading tracks...</div>}>
              <TrackList
                tracks={tracks}
                onAddTrack={handleAddTrack}
                onSelectTrack={setSelectedTrackId}
              />

              {selectedTrack && (
                <div className="p-6 bg-white rounded-xl shadow-sm">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedTrack.name}</h2>
                  </div>
                  
                  <Suspense fallback={<div>Loading sections...</div>}>
                    <SectionList
                      sections={selectedTrack.sections}
                      onAddSection={() => {
                        setAddingSubsectionFor(null);
                        setIsAddSectionModalOpen(true);
                      }}
                      onUpdateSection={handleUpdateSection}
                      onAddSubsection={handleAddSubsection}
                    />
                  </Suspense>
                </div>
              )}
            </Suspense>
          </ErrorBoundary>
        </main>

        <Modal
          isOpen={isAddSectionModalOpen}
          onClose={() => {
            setIsAddSectionModalOpen(false);
            setAddingSubsectionFor(null);
          }}
          title={addingSubsectionFor ? "Add Subsection" : "Add New Section"}
        >
          <SectionForm
            onSubmit={handleSubmitSection}
            isSubsection={!!addingSubsectionFor}
          />
        </Modal>
      </div>
    </div>
  );
}

export default App;