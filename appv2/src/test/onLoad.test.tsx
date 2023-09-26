import App from '../UI/App';
import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

describe('App', () => {
  test('should show title all the time', () => {
    render(<App/>);
  });
});

console.log('apple');
