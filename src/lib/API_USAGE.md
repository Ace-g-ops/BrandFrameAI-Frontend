# API Usage Guide

This guide explains how to use the API utilities in this project.

## Setup

The API is configured with axios and includes:
- Automatic authentication token injection
- Error handling and interceptors
- Type-safe interfaces
- FormData utilities for file uploads

## Basic Usage

### Import the API service

```typescript
import { api } from '@/lib/api';
import { handleApiError, getErrorMessage } from '@/lib/api-utils';
```

### Authentication

```typescript
// Register
try {
  const response = await api.register(name, email, password, passwordConfirmation);
  console.log('User:', response.user);
  // Token is automatically stored
} catch (error) {
  const message = getErrorMessage(error);
  console.error(message);
}

// Login
try {
  const response = await api.login(email, password);
  console.log('Logged in:', response.user);
} catch (error) {
  console.error(getErrorMessage(error));
}

// Logout
await api.logout();
// Token is automatically cleared

// Check authentication
if (api.isAuthenticated()) {
  // User is logged in
}
```

### Image Generation

```typescript
import { api, GenerateImageParams } from '@/lib/api';
import { validateImageFile } from '@/lib/api-utils';

// Validate file first
const file = event.target.files[0];
const validation = validateImageFile(file);
if (!validation.valid) {
  console.error(validation.error);
  return;
}

// Generate image
const params: GenerateImageParams = {
  product_image: file,
  shot_type: 'lifestyle', // or 'hero', 'flat_lay', 'context', 'white_background'
  product_description: 'A sleek smartphone', // optional
};

try {
  const image = await api.generateImage(params);
  console.log('Generated image URL:', image.generated_image_url);
  // Or use convenience field: image.url
} catch (error) {
  console.error(getErrorMessage(error));
}
```

### Gallery Operations

```typescript
// Get all images
const images = await api.getImages();
// Or with search
const filtered = await api.getImages('search term');

// Get single image
const image = await api.getImage(imageId);

// Delete image
await api.deleteImage(imageId);
```

### Preset Management

```typescript
import { CreatePresetParams, UpdatePresetParams } from '@/lib/api';

// Get all presets
const presets = await api.getPresets();

// Get single preset
const preset = await api.getPreset(presetId);

// Create preset
const newPreset: CreatePresetParams = {
  name: 'My Preset',
  description: 'A great preset',
  shot_type: 'lifestyle',
  structured_prompt: {
    style: 'professional',
    angle: '4 degree angle',
    lighting: 'soft natural light',
    composition: 'rule of thirds',
    mood: 'casual, authentic',
  },
};
const created = await api.createPreset(newPreset);

// Update preset
const updates: UpdatePresetParams = {
  name: 'Updated Name',
  description: 'New description',
};
const updated = await api.updatePreset(presetId, updates);

// Delete preset
await api.deletePreset(presetId);

// Apply preset to generate image
const generated = await api.applyPreset({
  preset_id: presetId,
  product_image: file,
  product_description: 'Product description', // optional
});
```

### Batch Processing

```typescript
const files = [file1, file2, file3]; // Array of File objects
const descriptions = ['Product 1', 'Product 2', 'Product 3']; // Optional

const result = await api.batchGenerate({
  preset_id: presetId,
  product_images: files,
  product_descriptions: descriptions, // optional
});

console.log(`Processing ${result.total_images} images...`);
// Note: This is async, images are processed in background
```

## Utility Functions

### File Validation

```typescript
import { validateImageFile } from '@/lib/api-utils';

const file = event.target.files[0];
const validation = validateImageFile(file);
if (!validation.valid) {
  alert(validation.error);
  return;
}
```

### File to Base64 (for previews)

```typescript
import { fileToBase64 } from '@/lib/api-utils';

const base64 = await fileToBase64(file);
// Use in <img src={base64} />
```

### Download Image

```typescript
import { downloadImage } from '@/lib/api-utils';

await downloadImage(imageUrl, 'my-image.jpg');
```

### Format Date

```typescript
import { formatDate } from '@/lib/api-utils';

const formatted = formatDate(image.created_at);
// Output: "Jan 15, 2024, 10:30 AM"
```

### Get Image URL

```typescript
import { getImageUrl } from '@/lib/api-utils';

// Handles both absolute and relative URLs
const fullUrl = getImageUrl(image.generated_image_url);
```

### Debounce Search

```typescript
import { debounce } from '@/lib/api-utils';

const debouncedSearch = debounce(async (query: string) => {
  const results = await api.getImages(query);
  setImages(results);
}, 300);

// In your component
<input onChange={(e) => debouncedSearch(e.target.value)} />
```

### Error Handling

```typescript
import { getErrorMessage, handleApiError } from '@/lib/api-utils';

try {
  await api.generateImage(params);
} catch (error) {
  // Both work the same way
  const message1 = getErrorMessage(error);
  const message2 = handleApiError(error);
  toast.error(message1);
}
```

## React Query Integration (Optional)

You can use React Query for caching and state management:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Query
const { data: images, isLoading } = useQuery({
  queryKey: ['images'],
  queryFn: () => api.getImages(),
});

// Mutation
const queryClient = useQueryClient();
const generateMutation = useMutation({
  mutationFn: api.generateImage,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['images'] });
  },
});
```

## Error Handling Best Practices

1. **Always use try-catch**:
```typescript
try {
  const result = await api.someMethod();
} catch (error) {
  const message = getErrorMessage(error);
  toast.error(message);
}
```

2. **Handle specific error types**:
```typescript
try {
  await api.generateImage(params);
} catch (error) {
  if (error.message.includes('Validation failed')) {
    // Handle validation errors
  } else if (error.message.includes('Network error')) {
    // Handle network errors
  } else {
    // Handle other errors
  }
}
```

3. **Use error boundaries** in React for unhandled errors.

## TypeScript Types

All types are exported from `@/lib/api`:

- `GenerateImageParams`
- `GeneratedImage`
- `Preset`
- `CreatePresetParams`
- `UpdatePresetParams`
- `ApplyPresetParams`
- `BatchGenerateParams`
- `AuthResponse`
- `User`

## Environment Variables

Set in `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Or use the default: `http://localhost:8000/api`

