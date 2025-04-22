// MongoDB initialization script for RadioX production

// Connect to the admin database
db = db.getSiblingDB('admin');

// Create application database if it doesn't exist
db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE || 'radiox');

// Create application user with appropriate permissions
db.createUser({
  user: process.env.MONGO_APP_USERNAME || 'radiox_app',
  pwd: process.env.MONGO_APP_PASSWORD || 'app_password',
  roles: [
    { role: 'readWrite', db: process.env.MONGO_INITDB_DATABASE || 'radiox' }
  ]
});

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        email: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        password: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        isAdmin: {
          bsonType: 'bool',
          description: 'must be a boolean'
        },
        isActive: {
          bsonType: 'bool',
          description: 'must be a boolean'
        }
      }
    }
  }
});

db.createCollection('audioClips', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'user'],
      properties: {
        title: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        description: {
          bsonType: 'string',
          description: 'must be a string'
        },
        fileUrl: {
          bsonType: 'string',
          description: 'must be a string'
        },
        duration: {
          bsonType: 'number',
          description: 'must be a number'
        },
        user: {
          bsonType: 'objectId',
          description: 'must be an objectId and is required'
        }
      }
    }
  }
});

db.createCollection('podcasts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'user'],
      properties: {
        title: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        description: {
          bsonType: 'string',
          description: 'must be a string'
        },
        imageUrl: {
          bsonType: 'string',
          description: 'must be a string'
        },
        user: {
          bsonType: 'objectId',
          description: 'must be an objectId and is required'
        },
        episodes: {
          bsonType: 'array',
          description: 'must be an array'
        }
      }
    }
  }
});

db.createCollection('featureFlags', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'enabled'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        description: {
          bsonType: 'string',
          description: 'must be a string'
        },
        enabled: {
          bsonType: 'bool',
          description: 'must be a boolean and is required'
        },
        percentage: {
          bsonType: 'number',
          description: 'must be a number between 0 and 100'
        },
        userIds: {
          bsonType: 'array',
          description: 'must be an array of strings'
        }
      }
    }
  }
});

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: 1 });
db.users.createIndex({ isAdmin: 1 });

db.audioClips.createIndex({ user: 1 });
db.audioClips.createIndex({ createdAt: 1 });
db.audioClips.createIndex({ title: 'text', description: 'text' });

db.podcasts.createIndex({ user: 1 });
db.podcasts.createIndex({ createdAt: 1 });
db.podcasts.createIndex({ title: 'text', description: 'text' });

db.featureFlags.createIndex({ name: 1 }, { unique: true });

// Create default feature flags
db.featureFlags.insertMany([
  {
    name: 'advanced_analytics',
    description: 'Enable advanced analytics features',
    enabled: false,
    percentage: 0,
    userIds: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'ai_recommendations',
    description: 'Enable AI-powered content recommendations',
    enabled: false,
    percentage: 0,
    userIds: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'new_audio_player',
    description: 'Enable new audio player interface',
    enabled: true,
    percentage: 100,
    userIds: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('MongoDB initialization completed successfully');
