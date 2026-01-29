import { CyberLayout } from "@/components/CyberLayout";
import { NeonCard, PageHeader, CyberButton } from "@/components/CyberComponents";
import { useFiles, useFileContent, useUpdateFile } from "@/hooks/use-bot-api";
import { FileCode, Save, RefreshCw, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function FilesPage() {
  const { data: files, isLoading: isLoadingList } = useFiles();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: fileData, isLoading: isLoadingContent } = useFileContent(selectedId);
  const { mutate: saveFile, isPending: isSaving } = useUpdateFile();
  const { toast } = useToast();
  
  const [content, setContent] = useState("");

  useEffect(() => {
    if (fileData?.content) {
      setContent(fileData.content);
    }
  }, [fileData]);

  const handleSave = () => {
    if (selectedId) {
      saveFile({ id: selectedId, content }, {
        onSuccess: () => toast({ title: "File Saved", description: "Changes successfully written to disk." }),
        onError: () => toast({ title: "Save Failed", description: "Could not write to file.", variant: "destructive" })
      });
    }
  };

  return (
    <CyberLayout>
      <PageHeader 
        title="File Editor" 
        subtitle="Direct access to bot configuration files." 
      />

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
        {/* File List */}
        <div className="w-full lg:w-1/4">
          <NeonCard className="h-full p-0 flex flex-col" color="blue">
            <div className="p-4 border-b border-white/10 font-cyber text-neon-blue font-bold tracking-wider">
              EXPLORER
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {isLoadingList ? (
                <div className="p-4 text-sm text-gray-500 font-mono animate-pulse">Loading files...</div>
              ) : files?.map(file => (
                <button
                  key={file.id}
                  onClick={() => setSelectedId(file.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between group transition-all ${
                    selectedId === file.id ? 'bg-neon-blue/20 text-white' : 'hover:bg-white/5 text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileCode className={`w-4 h-4 ${selectedId === file.id ? 'text-neon-blue' : 'text-gray-500'}`} />
                    <span className="text-sm font-mono truncate">{file.filename}</span>
                  </div>
                  {selectedId === file.id && <ChevronRight className="w-3 h-3 text-neon-blue" />}
                </button>
              ))}
            </div>
          </NeonCard>
        </div>

        {/* Editor Area */}
        <div className="w-full lg:w-3/4 flex flex-col">
          <NeonCard className="flex-1 p-0 flex flex-col overflow-hidden" color="purple">
            {selectedId ? (
              <>
                <div className="p-2 border-b border-white/10 flex items-center justify-between bg-[#111]">
                  <div className="px-4 font-mono text-sm text-gray-400">
                    {fileData?.filename || "Loading..."}
                  </div>
                  <div className="flex items-center gap-2">
                    <CyberButton 
                      variant="primary" 
                      className="h-8 text-xs px-3"
                      onClick={handleSave}
                      disabled={isSaving || isLoadingContent}
                    >
                      <Save className="w-3 h-3 mr-2" /> SAVE
                    </CyberButton>
                  </div>
                </div>
                
                <div className="flex-1 relative bg-[#0a0a0b]">
                  {isLoadingContent ? (
                    <div className="absolute inset-0 flex items-center justify-center text-neon-purple font-mono animate-pulse">
                      READING FILE STREAM...
                    </div>
                  ) : (
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full h-full bg-transparent text-gray-300 font-mono text-sm p-4 focus:outline-none resize-none"
                      spellCheck={false}
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
                <FileCode className="w-16 h-16 mb-4 opacity-20" />
                <p className="font-mono text-sm">SELECT A FILE TO EDIT</p>
              </div>
            )}
          </NeonCard>
        </div>
      </div>
    </CyberLayout>
  );
}
