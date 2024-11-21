# Maternal Health Tracking System Canister

A decentralized maternal health tracking system built on the Internet Computer Protocol (ICP) platform using Azle (TypeScript CDK).

## Overview

This canister provides a comprehensive system for tracking maternal health data, managing prenatal visits, and coordinating care between expectant mothers and healthcare providers. It includes automated risk assessment and real-time health monitoring capabilities.

## Features

- **Real-time Health Monitoring**
  - Vital signs tracking
  - Automated risk assessment
  - Alert system for concerning values

- **Care Coordination**
  - Prenatal visit management
  - Provider activity tracking
  - Emergency contact system

- **Data Management**
  - Secure health records
  - Complete medical history
  - Prescription tracking

## Prerequisites

Before you begin, ensure you have installed:

- Node.js (version 20 or higher)
- DFX (DFINITY Canister SDK version 0.22.0)
- Podman (for MacOS/Linux users)

## Installation

1. **Install Node Version Manager (nvm)**
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
   ```

2. **Switch to Node.js version 20**
   ```bash
   nvm use 20
   ```

3. **Install DFX**
   ```bash
   DFX_VERSION=0.22.0 sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
   ```

4. **Add DFX to your PATH**
   ```bash
   echo 'export PATH="$PATH:$HOME/bin"' >> "$HOME/.bashrc"
   ```

5. **Verify installations**
   ```bash
   dfx --version
   node --version
   ```

## Project Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Stella-Achar-Oiro/maternal-health-tracking-system.git
   cd maternal-health-tracking-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## Running the Canister

1. **Start the local Internet Computer**
   ```bash
   dfx start --host 127.0.0.1:8000
   ```

   For a clean start:
   ```bash
   dfx start --host 127.0.0.1:8000 --clean
   ```

2. **Deploy the canister**
   ```bash
   dfx deploy
   ```

   Development mode with auto-reload:
   ```bash
   AZLE_AUTORELOAD=true dfx deploy
   ```

3. **Get your canister ID**
   ```bash
   dfx canister id message_board
   ```

## API Documentation

### Maternal Profiles

#### Create Profile
```bash
curl -X POST http://<canister-id>.localhost:8000/maternal-profiles \
-H "Content-type: application/json" \
-d '{
    "name": "Jane Doe",
    "age": 28,
    "bloodType": "O+",
    "emergencyContact": "+1234567890",
    "primaryCareProviderId": "provider-123",
    "dueDate": "2024-12-25"
}'
```

#### Get Profile
```bash
curl http://<canister-id>.localhost:8000/maternal-profiles/<profile-id>
```

### Health Metrics

#### Record Metrics
```bash
curl -X POST http://<canister-id>.localhost:8000/health-metrics \
-H "Content-type: application/json" \
-d '{
    "maternalProfileId": "profile-123",
    "weight": 65,
    "bloodPressureSystolic": 120,
    "bloodPressureDiastolic": 80,
    "bloodSugar": 95,
    "hemoglobinLevels": 12,
    "recordedById": "provider-123",
    "notes": "Regular checkup"
}'
```

## Architecture

### Data Storage
- Uses `StableBTreeMap` for persistent storage
- Separate storage for profiles, metrics, visits, and alerts
- Automatic data serialization and validation

### Risk Assessment
- Real-time monitoring of vital signs
- Automated alerts for concerning values
- Multi-level risk categorization (LOW, MEDIUM, HIGH)

### Security Features
- Input validation for all medical data
- Provider verification
- Active status checking
- Error handling with logging

## Troubleshooting

### Common Issues

1. **Configuration Reset**
   If you need to reset the StableBTreeMap configuration:
   ```bash
   dfx start --host 127.0.0.1:8000 --clean
   ```

2. **Node Version**
   Ensure correct Node.js version:
   ```bash
   nvm use 20
   ```

3. **Port Conflicts**
   If port 8000 is in use:
   ```bash
   lsof -i :8000
   kill -9 <PID>
   ```

### Error Messages

- "Healthcare provider not found": Verify provider ID exists
- "Invalid blood pressure range": Check input values
- "Failed to serialize data": Verify date formats

## Development Guidelines

1. **Code Style**
   - Follow TypeScript best practices
   - Use proper error handling
   - Add comprehensive documentation

2. **Testing**
   - Test all API endpoints
   - Validate input ranges
   - Check error scenarios

3. **Deployment**
   - Use clean deployment for schema changes
   - Keep development mode off in production
   - Monitor storage usage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under [Insert License Name]

## Support

Need help? Here are your options:

- Create an issue in the repository
- Contact the development team
- Check the troubleshooting guide

## Acknowledgments

- DFINITY Foundation
- Internet Computer Protocol
- Azle Development Team