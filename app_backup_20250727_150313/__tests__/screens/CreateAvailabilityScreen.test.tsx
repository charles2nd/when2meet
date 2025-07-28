import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import CreateAvailabilityScreen from '../../screens/CreateAvailabilityScreen';
import { useMockData } from '../../contexts/MockDataContext';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';

// Mock dependencies
jest.mock('../../contexts/MockDataContext');
jest.mock('@react-navigation/native');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
};

const mockRoute = {
  params: {
    teamId: 'team1',
  },
};

const mockContextData = {
  createAvailabilityEvent: jest.fn(),
  currentUser: {
    id: 'user1',
    name: 'Test User',
    email: 'test@example.com',
  },
  currentTeam: {
    id: 'team1',
    name: 'Test Team',
  },
};

describe('CreateAvailabilityScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
    (useRoute as jest.Mock).mockReturnValue(mockRoute);
    (useMockData as jest.Mock).mockReturnValue(mockContextData);
    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      if (buttons && buttons.length > 0 && buttons[0].onPress) {
        buttons[0].onPress();
      }
    });
  });

  test('renders create availability screen correctly', () => {
    const { getByDisplayValue, getByText } = render(<CreateAvailabilityScreen />);
    
    expect(getByText('Create Availability Event')).toBeTruthy();
    expect(getByText('Event Title')).toBeTruthy();
    expect(getByText('Save Event')).toBeTruthy();
  });

  test('navigates to main screen when back button is pressed', () => {
    const { getByText } = render(<CreateAvailabilityScreen />);
    
    const backButton = getByText('← Back');
    fireEvent.press(backButton);
    
    expect(mockNavigation.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'RESET',
      })
    );
  });

  test('shows error when trying to save without title', async () => {
    const { getByText } = render(<CreateAvailabilityScreen />);
    
    const saveButton = getByText('Save Event');
    fireEvent.press(saveButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter an event title');
    });
  });

  test('saves event and navigates back after successful creation', async () => {
    mockContextData.createAvailabilityEvent.mockReturnValue('event123');
    
    const { getByDisplayValue, getByText, getByPlaceholderText } = render(<CreateAvailabilityScreen />);
    
    // Fill in the title field
    const titleInput = getByPlaceholderText('Enter event title');
    fireEvent.changeText(titleInput, 'Test Event');
    
    // Press save button
    const saveButton = getByText('Save Event');
    fireEvent.press(saveButton);
    
    await waitFor(() => {
      expect(mockContextData.createAvailabilityEvent).toHaveBeenCalledWith({
        title: 'Test Event',
        description: '',
        teamId: 'team1',
        createdBy: 'user1',
        startDate: expect.any(String),
        endDate: expect.any(String),
        startTime: '09:00',
        endTime: '17:00',
        requiresPassword: false,
      });
    });

    await waitFor(() => {
      expect(mockNavigation.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'RESET',
          payload: expect.objectContaining({
            index: 0,
            routes: expect.arrayContaining([
              expect.objectContaining({
                name: '(tabs)',
              }),
            ]),
          }),
        })
      );
    });
  });

  test('shows error when event creation fails', async () => {
    mockContextData.createAvailabilityEvent.mockImplementation(() => {
      throw new Error('Creation failed');
    });
    
    const { getByPlaceholderText, getByText } = render(<CreateAvailabilityScreen />);
    
    // Fill in the title field
    const titleInput = getByPlaceholderText('Enter event title');
    fireEvent.changeText(titleInput, 'Test Event');
    
    // Press save button
    const saveButton = getByText('Save Event');
    fireEvent.press(saveButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to create event. Please try again.');
    });
  });

  test('shows error when user or team is missing', async () => {
    (useMockData as jest.Mock).mockReturnValue({
      ...mockContextData,
      currentUser: null,
    });
    
    const { getByPlaceholderText, getByText } = render(<CreateAvailabilityScreen />);
    
    // Fill in the title field
    const titleInput = getByPlaceholderText('Enter event title');
    fireEvent.changeText(titleInput, 'Test Event');
    
    // Press save button
    const saveButton = getByText('Save Event');
    fireEvent.press(saveButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'User or team not found');
    });
  });

  test('updates form fields correctly', () => {
    const { getByPlaceholderText } = render(<CreateAvailabilityScreen />);
    
    const titleInput = getByPlaceholderText('Enter event title');
    const descriptionInput = getByPlaceholderText('Add event description...');
    
    fireEvent.changeText(titleInput, 'New Event Title');
    fireEvent.changeText(descriptionInput, 'Event description');
    
    expect(titleInput.props.value).toBe('New Event Title');
    expect(descriptionInput.props.value).toBe('Event description');
  });
});