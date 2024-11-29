import AIPlanetLogo from '../assets/AIPlanetLogo.svg';
import Plus from '../assets/plus.svg';
import File from '../assets/file.svg';
import { useRef, useState } from 'react';

function Header() {
    const [name, setName] = useState('');
    const fileInputRef = useRef(null);

    const handleButtonClick = () => {
        fileInputRef.current.click();
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0]?.name.slice(0, 10);
        if (file) {
            setName(file);
            console.log('Selected file: ', file);
        }
    }

    return (
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

                    <button
                        className="bg-white text-black border-2 border-black py-1 px-4 rounded-2xl hover:bg-gray-200 flex items-center space-x-1 sm:space-x-2"
                        onClick={handleButtonClick}
                    >
                        <span className="flex items-center justify-center h-8 text-white">
                            <img src={Plus} alt="Plus Icon" className="h-5 w-5" />
                        </span>
                        <p className="font-semibold hidden sm:block">Upload File</p>
                    </button>

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
    );
}

export default Header;
