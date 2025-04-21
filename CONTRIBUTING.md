# Contributing to RadioX Free Edition

Thank you for your interest in contributing to RadioX Free Edition! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

We expect all contributors to adhere to our Code of Conduct. Please read it before participating.

- Be respectful and inclusive
- Be patient and welcoming
- Be thoughtful
- Be collaborative
- When disagreeing, try to understand why

## Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/radiox-free-edition.git
   cd radiox-free-edition
   ```
3. **Add the original repository as a remote**:
   ```bash
   git remote add upstream https://github.com/original-org/radiox-free-edition.git
   ```
4. **Install dependencies**:
   ```bash
   npm run install-all
   ```
5. **Create a new branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. **Make your changes** in your feature branch.
2. **Follow the coding standards** outlined below.
3. **Write or update tests** as necessary.
4. **Run tests** to ensure they pass:
   ```bash
   npm test
   ```
5. **Run linting** to ensure code quality:
   ```bash
   npm run lint
   ```
6. **Commit your changes** with a descriptive commit message:
   ```bash
   git commit -m "Add feature: your feature description"
   ```
7. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Create a pull request** from your fork to the original repository.

## Pull Request Process

1. Ensure your PR includes a clear description of the changes and the value they add.
2. Update documentation as needed.
3. Include screenshots or GIFs for UI changes if applicable.
4. Make sure all tests pass and there are no linting errors.
5. Your PR will be reviewed by at least one maintainer.
6. Address any requested changes from the review.
7. Once approved, your PR will be merged.

## Coding Standards

### General Guidelines

- Use consistent indentation (2 spaces).
- Use meaningful variable and function names.
- Keep functions small and focused on a single responsibility.
- Comment your code when necessary, especially for complex logic.
- Follow the principle of DRY (Don't Repeat Yourself).

### Frontend Guidelines

- Use functional components with hooks.
- Follow the component structure in the project.
- Use Tailwind CSS for styling.
- Ensure components are accessible (WCAG 2.1 Level AA).
- Use React Context API or Redux for state management.

### Backend Guidelines

- Follow RESTful API design principles.
- Use async/await for asynchronous operations.
- Implement proper error handling.
- Validate all input data.
- Document API endpoints.

## Testing Guidelines

- Write unit tests for all new functionality.
- Ensure tests are isolated and don't depend on external services.
- Mock external dependencies when necessary.
- Aim for high test coverage, especially for critical paths.
- Include integration tests for API endpoints.

## Documentation

- Update the README.md if you change functionality.
- Document all API endpoints using JSDoc or similar.
- Include comments in your code for complex logic.
- Update any relevant documentation in the docs/ directory.

## Community

- Join our [Discord server](https://discord.gg/radiox) for discussions.
- Check out the [issue tracker](https://github.com/original-org/radiox-free-edition/issues) for ways to contribute.
- Attend our monthly community calls (details in Discord).

Thank you for contributing to RadioX Free Edition! Your efforts help make this project better for everyone.
