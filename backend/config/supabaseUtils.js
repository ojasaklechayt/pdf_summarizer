const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_PROJECTURL,
    process.env.SUPABASE_ANON,
    {
        auth: {
            persistSession: false
        }
    }
);

const BUCKET_NAME = 'PDF Storage';

async function uploadFile(file) {
    try {
        if (!file || !file.buffer) {
            throw new Error("Invalid file object");
        }

        if (file.type !== 'application/pdf') {
            throw new Error("Only PDF files are allowed.");
        }

        // Create a more organized file path
        const timestamp = new Date().getTime();
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `All PDFs/${timestamp}_${sanitizedFileName}`;

        // Upload the file to Supabase storage
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file.buffer, {
                contentType: 'application/pdf',
                upsert: false
            });

        if (error) {
            console.error('Supabase storage error:', error);
            throw new Error(error.message);
        }

        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(data.path);

        // Return the complete file information
        return {
            path: data.path,
            publicUrl,
            size: data.size,
            fileName: sanitizedFileName,
            uploadedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error in uploadFile:', error);
        throw error;
    }
}

async function getFile(filepath) {
    try {
        // First check if file exists
        console.log(filepath);
        const { data: fileExists } = await supabase.storage
            .from(BUCKET_NAME)
            .list(filepath.split('/').slice(0, -1).join('/'), {
                limit: 1,
                search: filepath.split('/').pop()
            });

        if (!fileExists || fileExists.length === 0) {
            throw new Error('File not found in storage');
        }

        // Get the file data
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .download(filepath);

        if (error) {
            console.error('Supabase download error:', error);
            throw new Error(error.message);
        }

        // Convert blob to buffer if needed
        if (data instanceof Blob) {
            const arrayBuffer = await data.arrayBuffer();
            return Buffer.from(arrayBuffer);
        }

        return data;
    } catch (error) {
        console.error("Error in getFile:", error);
        throw error;
    }
}

module.exports = {
    uploadFile,
    getFile,
};
