import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || 'http://127.0.0.1:54321'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing')

const supabase = createClient(url, key)

const { data, error } = await supabase.storage.createBucket('policy-documents', {
  public: false,
  fileSizeLimit: 50 * 1024 * 1024,
  allowedMimeTypes: [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/tiff'
  ]
})

if (error && !error.message.toLowerCase().includes('already exists')) {
  throw error
}

console.log('policy-documents ready')
