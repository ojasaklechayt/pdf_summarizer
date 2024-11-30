import AIPlanetLogo from '../assets/AIPlanetLogo.svg';
import Plus from '../assets/plus.svg';
import File from '../assets/file.svg';
import { useRef, useState, useContext } from 'react';
import { DocumentContext } from '../context/DocumentProvider';
import useSocket from '../useSocket';
import { Toaster, toast } from 'sonner'; // Import Sonner toast

const API = "http://localhost:3000";

function Header() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const { setDocumentId } = useContext(DocumentContext);
    useSocket();

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setName(file.name);
            const formData = new FormData();
            formData.append('pdf', file);

            try {
                setLoading(true);
                const response = await fetch(`${API}/upload`, {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();

                if (response.ok) {
                    // Success toast using Sonner
                    toast.success('PDF uploaded successfully!', {
                        description: `File: ${file.name}`,
                        duration: 2000,
                    });
                    console.log('File uploaded successfully', data);

                    setDocumentId(data.document.id);
                } else {
                    // Error toast using Sonner
                    toast.error('Error uploading PDF', {
                        description: data.message || 'Please try again.',
                        duration: 2000,
                    });
                }
            } catch (error) {
                // Error toast for network/fetch errors
                toast.error('Upload Failed', {
                    description: 'An error occurred during file upload.',
                    duration: 2000,
                });
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <>
            <Toaster richColors position="top-right" />
            <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 p-4">
                <div className="flex items-center justify-between">
                    <img src={AIPlanetLogo} alt="AI Planet Logo" className="h-10" />
                    <div className="flex items-center space-x-4">
                        {name && (
                            <div className="flex items-center space-x-2 sm:space-x-4">
                                <img src={File} alt="File Icon" className="h-8 w-8 sm:h-5 sm:w-5" />
                                <p className="text-emerald-500 font-semibold text-sm sm:text-base md:text-lg">
                                    {name}
                                </p>
                            </div>
                        )}

                        {loading ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-4 border-t-4 border-gray-500 rounded-full animate-spin"></div>
                                <p>Uploading...</p>
                            </div>
                        ) : (
                            <button
                                className="bg-white text-black border-2 border-black py-1 px-4 rounded-2xl hover:bg-gray-200 flex items-center space-x-1 sm:space-x-2"
                                onClick={handleButtonClick}
                            >
                                <img src={Plus} alt="Plus Icon" className="h-5 w-5" />
                                <p className="font-semibold hidden sm:block">Upload File</p>
                            </button>
                        )}

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".pdf"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

export default Header;