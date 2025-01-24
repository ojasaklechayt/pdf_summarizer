import { useRef, useState, useContext } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'sonner';

// Import assets
import AIPlanetLogo from '../assets/AIPlanetLogo.svg';
import Plus from '../assets/plus.svg';
import File from '../assets/file.svg';

// Import context and hooks
import { DocumentContext } from '../context/DocumentProvider';
import useSocket from '../useSocket';

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://pdf-summarizer-uldt.onrender.com";
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB max file size
const ALLOWED_FILE_TYPES = ['.pdf'];

// Minimalistic Loader Component
const UploadLoader = () => (
    <div className="w-6 h-6 border-4 border-t-4 rounded-full animate-spin border-emerald-500 border-t-emerald-200" />
);

function Header() {
    // State management
    const [fileName, setFileName] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Refs and context
    const fileInputRef = useRef(null);
    const { setDocumentId } = useContext(DocumentContext);

    // Custom hook
    useSocket();

    // Validate file before upload
    const validateFile = (file) => {
        // Check file type
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
            toast.error('Invalid File Type', {
                description: `Please upload only PDF files.`,
                duration: 3000,
            });
            return false;
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            toast.error('File Too Large', {
                description: `Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
                duration: 3000,
            });
            return false;
        }

        return true;
    };

    // File upload handler
    const handleFileUpload = async (file) => {
        // Validate file first
        if (!validateFile(file)) {
            fileInputRef.current.value = ''; // Reset file input
            return;
        }

        // Prepare form data
        const formData = new FormData();
        formData.append('pdf', file);

        try {
            setIsUploading(true);
            setFileName(file.name);

            // Use axios for upload with progress tracking
            const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Success handling
            const { document } = response.data;
            setDocumentId(document.documentId);

            toast.success('PDF uploaded successfully!', {
                description: `File: ${file.name}`,
                duration: 2000,
            });

        } catch (error) {
            // Comprehensive error handling
            const errorMessage = error.response?.data?.message
                || error.message
                || 'An unexpected error occurred';

            toast.error('Upload Failed', {
                description: errorMessage,
                duration: 3000,
            });

            console.error('File upload error:', error);
        } finally {
            setIsUploading(false);
            fileInputRef.current.value = ''; // Reset file input
        }
    };

    // File input change handler
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    return (
        <>
            <Toaster
                richColors
                position="top-right"
                expand={true}
                closeButton={true}
            />
            <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 p-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <img
                        src={AIPlanetLogo}
                        alt="AI Planet Logo"
                        className="h-10"
                    />
                    <div className="flex items-center space-x-6">
                        {fileName && (
                            <div className="flex items-center space-x-4">
                                <img
                                    src={File}
                                    alt="File Icon"
                                    className="h-6 w-6"
                                />
                                <p className="text-emerald-500 font-semibold text-sm max-w-[200px] truncate">
                                    {fileName}
                                </p>
                            </div>
                        )}

                        {isUploading ? (
                            <div className="flex items-center space-x-4">
                                <UploadLoader />
                            </div>
                        ) : (
                            <button
                                className="bg-white text-black border-2 border-black 
                                           py-1 px-4 rounded-2xl hover:bg-gray-200 
                                           flex items-center space-x-2 
                                           transition-colors duration-200"
                                onClick={() => fileInputRef.current.click()}
                            >
                                <img
                                    src={Plus}
                                    alt="Plus Icon"
                                    className="h-5 w-5"
                                />
                                <span className="font-semibold hidden sm:block">
                                    Upload File
                                </span>
                            </button>
                        )}

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept={ALLOWED_FILE_TYPES.join(',')}
                            onChange={handleFileChange}
                        />
                    </div>
                </div>
            </header>
        </>
    );
}

export default Header;