# React Native Expo MVVM Architecture Specification

## Purpose
  * The unified view of personal + group finances is genuinely missing from most tools
  * Long-term asset growth tracking with goal-based saving (like the roof example) is powerful
  * Discord-style group management with permissions and commenting is intuitive

## Overview
This document defines the frontend architecture standards for our React Native Expo mobile application using the Model-View-ViewModel (MVVM) pattern.

## Architecture Pattern: MVVM

### Model Layer
- **Purpose**: Data management and business logic
- **Components**: 
  - API services (`/services`)
  - Data models/interfaces (`/models`)
  - Local storage handlers (`/storage`)
  - Business logic utilities (`/utils`)
- **Rules**: 
  - No direct UI dependencies
  - Pure functions where possible
  - Centralized data validation

### View Layer
- **Purpose**: UI presentation and user interaction
- **Components**:
  - React Native components (`/components`)
  - Screen components (`/screens`)
  - Navigation configuration (`/navigation`)
- **Rules**:
  - No direct business logic
  - Minimal state management
  - Focus on presentation only

### ViewModel Layer
- **Purpose**: Bridge between Model and View
- **Components**:
  - Custom hooks (`/hooks`)
  - Context providers (`/contexts`)
  - State management (`/store` if using Redux/Zustand)
- **Rules**:
  - Handle UI state and business logic coordination
  - Expose data and actions to Views
  - Manage loading, error, and success states

## Project Structure
```
src/
├── components/          # Reusable UI components
├── screens/            # Screen-level components
├── navigation/         # Navigation configuration
├── hooks/             # Custom hooks (ViewModels)
├── contexts/          # React Context providers
├── features/          # features of the product (Authentication, Budget, etc)
├── services/          # API and external services
├── models/            # TypeScript interfaces/types
├── utils/             # Helper functions
├── storage/           # Local storage logic
└── constants/         # App constants
```

## Naming Conventions
- **Components**: camelCase (`userProfile.tsx`)
- **Hooks**: camelCase with 'use' prefix (`useUserProfile.ts`)
- **Services**: camelCase with service suffix (`authService.ts`)
- **Models**: camelCase with type/interface keyword (`userModel.ts`)

## State Management Guidelines
- Use React hooks for local state
- Context API for shared state across screens
- Consider external libraries (Redux Toolkit) for complex global state
- Keep ViewModels stateless when possible - delegate to hooks/contexts

## Component Guidelines
- Functional components only
- Use TypeScript for all components
- Props interface defined for each component
- Implement proper error boundaries
- Follow React Native performance best practices

## Data Flow
1. **User Interaction** → View triggers ViewModel action
2. **ViewModel** → Calls appropriate Model services
3. **Model** → Processes data, calls APIs, updates storage
4. **Model Response** → ViewModel updates state/context
5. **State Change** → View re-renders with new data

## Testing Strategy
- Unit tests for Models (services, utils)
- Hook testing for ViewModels
- Component testing for Views
- Integration tests for complete user flows

## Key Principles
- **Separation of Concerns**: Each layer has distinct responsibilities
- **Testability**: Business logic isolated from UI
- **Reusability**: Components and hooks designed for reuse
- **Type Safety**: Full TypeScript coverage
- **Performance**: Optimized renders and memory usage

## Expo-Specific Considerations
- Leverage Expo SDK features appropriately
- Consider EAS Build for deployment
- Use Expo Router for navigation (if applicable)
- Handle platform differences (iOS/Android)

---
*This specification should be referenced for all frontend development decisions and code reviews.*