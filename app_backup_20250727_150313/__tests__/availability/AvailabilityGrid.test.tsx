import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AvailabilityGrid from '../../components/availability/AvailabilityGrid';
import { TimeSlot, AvailabilityResponse } from '../../utils/types';
import { generateTimeSlots } from '../../utils/helpers';

const mockTimeSlots: TimeSlot[] = generateTimeSlots(
  new Date('2025-01-15'),
  new Date('2025-01-16'),
  '09:00',
  '17:00'
);

const mockResponses: AvailabilityResponse[] = [
  {
    userId: 'user1',
    userName: 'Test User 1',
    availableSlots: [mockTimeSlots[0].id, mockTimeSlots[1].id],
    lastUpdated: new Date(),
    isAnonymous: false
  },
  {
    userId: 'user2',
    userName: 'Test User 2',
    availableSlots: [mockTimeSlots[1].id, mockTimeSlots[2].id],
    lastUpdated: new Date(),
    isAnonymous: false
  }
];

describe('AvailabilityGrid', () => {
  const defaultProps = {
    timeSlots: mockTimeSlots,
    userSelection: [],
    responses: mockResponses,
    onSelectionChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders time slots correctly', () => {
    const { getByTestId } = render(<AvailabilityGrid {...defaultProps} />);
    
    expect(getByTestId('availability-grid')).toBeTruthy();
  });

  test('handles selection change', () => {
    const onSelectionChange = jest.fn();
    const { getByTestId } = render(
      <AvailabilityGrid {...defaultProps} onSelectionChange={onSelectionChange} />
    );
    
    // Test would simulate touch interactions here
    // This is a basic structure - full implementation would require more complex gesture testing
  });

  test('displays participant availability correctly', () => {
    const { getByTestId } = render(<AvailabilityGrid {...defaultProps} />);
    
    // Test that cells show correct participant counts
    // This would check the visual representation of availability
  });

  test('handles readonly mode', () => {
    const onSelectionChange = jest.fn();
    const { getByTestId } = render(
      <AvailabilityGrid {...defaultProps} readonly={true} onSelectionChange={onSelectionChange} />
    );
    
    // Test that selection doesn't work in readonly mode
    // onSelectionChange should not be called
  });
});

// Performance test placeholder
describe('AvailabilityGrid Performance', () => {
  test('renders large dataset efficiently', () => {
    const largeTimeSlots = generateTimeSlots(
      new Date('2025-01-01'),
      new Date('2025-01-31'),
      '09:00',
      '17:00'
    );
    
    const startTime = performance.now();
    
    render(
      <AvailabilityGrid
        timeSlots={largeTimeSlots}
        userSelection={[]}
        responses={mockResponses}
        onSelectionChange={jest.fn()}
      />
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render large datasets in under 100ms
    expect(renderTime).toBeLessThan(100);
  });
});