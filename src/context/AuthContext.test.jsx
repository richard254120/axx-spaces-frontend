import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

function TestConsumer() {
  const { user, token, isAuthenticated, login, logout, updateUser } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.name : 'none'}</span>
      <span data-testid="token">{token || 'none'}</span>
      <span data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</span>
      <button onClick={() => login('test-token', { name: 'John' })}>Login</button>
      <button onClick={() => updateUser({ name: 'Jane' })}>Update</button>
      <button onClick={() => logout('/login')}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.restoreAllMocks();
    delete window.location;
    window.location = { href: '' };
  });

  it('starts with no user when localStorage is empty', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('none');
    expect(screen.getByTestId('token')).toHaveTextContent('none');
    expect(screen.getByTestId('auth')).toHaveTextContent('no');
  });

  it('restores user and token from localStorage on mount', () => {
    localStorageMock.setItem('token', 'saved-token');
    localStorageMock.setItem('user', JSON.stringify({ name: 'Saved User' }));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('Saved User');
    expect(screen.getByTestId('token')).toHaveTextContent('saved-token');
    expect(screen.getByTestId('auth')).toHaveTextContent('yes');
  });

  it('login sets user and token', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Login').click();
    });

    expect(screen.getByTestId('user')).toHaveTextContent('John');
    expect(screen.getByTestId('token')).toHaveTextContent('test-token');
    expect(screen.getByTestId('auth')).toHaveTextContent('yes');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify({ name: 'John' }));
  });

  it('updateUser partially updates user data', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Login').click();
    });

    await act(async () => {
      screen.getByText('Update').click();
    });

    expect(screen.getByTestId('user')).toHaveTextContent('Jane');
  });

  it('logout clears user and token and redirects', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Login').click();
    });

    await act(async () => {
      screen.getByText('Logout').click();
    });

    expect(screen.getByTestId('user')).toHaveTextContent('none');
    expect(screen.getByTestId('token')).toHaveTextContent('none');
    expect(screen.getByTestId('auth')).toHaveTextContent('no');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    expect(window.location.href).toBe('/login');
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorageMock.setItem('user', 'not-valid-json');
    localStorageMock.setItem('token', 'some-token');

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('none');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
  });
});
