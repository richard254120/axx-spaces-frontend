import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchUserProfile, updateUserProfile, buildProfileFormData } from './profile';

const API_BASE = 'https://axx-spaces-backend-1.onrender.com/api';

describe('buildProfileFormData', () => {
  it('appends name when provided', () => {
    const fd = buildProfileFormData({ name: 'John' });
    expect(fd.get('name')).toBe('John');
  });

  it('appends phone when provided', () => {
    const fd = buildProfileFormData({ phone: '0712345678' });
    expect(fd.get('phone')).toBe('0712345678');
  });

  it('appends county when provided', () => {
    const fd = buildProfileFormData({ county: 'Nairobi' });
    expect(fd.get('county')).toBe('Nairobi');
  });

  it('appends vehicleType when provided', () => {
    const fd = buildProfileFormData({ vehicleType: 'Truck' });
    expect(fd.get('vehicleType')).toBe('Truck');
  });

  it('appends experienceYears when provided and not empty string', () => {
    const fd = buildProfileFormData({ experienceYears: 5 });
    expect(fd.get('experienceYears')).toBe('5');
  });

  it('does not append experienceYears when empty string', () => {
    const fd = buildProfileFormData({ experienceYears: '' });
    expect(fd.get('experienceYears')).toBeNull();
  });

  it('appends services as JSON string', () => {
    const services = ['moving', 'packing'];
    const fd = buildProfileFormData({ services });
    expect(fd.get('services')).toBe(JSON.stringify(services));
  });

  it('appends description when provided', () => {
    const fd = buildProfileFormData({ description: 'Test desc' });
    expect(fd.get('description')).toBe('Test desc');
  });

  it('appends bio when provided', () => {
    const fd = buildProfileFormData({ bio: 'My bio' });
    expect(fd.get('bio')).toBe('My bio');
  });

  it('appends avatar file when provided', () => {
    const file = new File([''], 'avatar.png', { type: 'image/png' });
    const fd = buildProfileFormData({ avatarFile: file });
    expect(fd.get('avatar')).toBe(file);
  });

  it('appends removeProfileImage flag when true', () => {
    const fd = buildProfileFormData({ removeProfileImage: true });
    expect(fd.get('removeProfileImage')).toBe('true');
  });

  it('does not append null values', () => {
    const fd = buildProfileFormData({});
    expect(fd.get('name')).toBeNull();
    expect(fd.get('phone')).toBeNull();
    expect(fd.get('county')).toBeNull();
  });

  it('builds a complete form data with multiple fields', () => {
    const fd = buildProfileFormData({
      name: 'Jane',
      phone: '0798765432',
      county: 'Mombasa',
      bio: 'Hello',
    });
    expect(fd.get('name')).toBe('Jane');
    expect(fd.get('phone')).toBe('0798765432');
    expect(fd.get('county')).toBe('Mombasa');
    expect(fd.get('bio')).toBe('Hello');
  });
});

describe('fetchUserProfile', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls the correct endpoint with auth header', async () => {
    const mockUser = { name: 'Test', email: 'test@example.com' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { user: mockUser } }),
    }));

    const result = await fetchUserProfile('test-token');
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/profile`,
      { headers: { Authorization: 'Bearer test-token' } }
    );
    expect(result).toEqual(mockUser);
  });

  it('throws on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'Unauthorized' }),
    }));

    await expect(fetchUserProfile('bad-token')).rejects.toThrow('Unauthorized');
  });
});

describe('updateUserProfile', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('sends PATCH request with form data', async () => {
    const mockResponse = { success: true };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    }));

    const formData = new FormData();
    formData.append('name', 'Updated');

    const result = await updateUserProfile('token123', formData);
    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/profile`,
      {
        method: 'PATCH',
        headers: { Authorization: 'Bearer token123' },
        body: formData,
      }
    );
    expect(result).toEqual(mockResponse);
  });

  it('throws on server error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Server Error' }),
    }));

    await expect(updateUserProfile('token', new FormData())).rejects.toThrow('Server Error');
  });
});
