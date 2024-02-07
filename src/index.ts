import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import mongoose from 'mongoose';

// MongoDB connection
mongoose.connect("mongodb+srv://admin:admin@singpost.nk5opnz.mongodb.net/?retryWrites=true&w=majority");

// Define Mongoose schemas and models
const { Schema } = mongoose;

const sectorSchema = new Schema({
  sector: Number,
  beats: [
    {
      //unique_id: Number,
      beat_id: Number,
      sequences: [
        {
          seq_id: Number,
          address: String,
          postal_code: Number,
          longitude: Number,
          latitude: Number,
          types: String,
          unique_id: String,
          num_of_units: Number,
          shipments: [
            {
              date: String,
              num_of_mails: Number,
              num_of_packets: Number,
              bundles_volume: Number,
              bundles_weight: Number,
              bundles_dwell_time: Number,
              num_of_small_parcels: Number,
              small_parcels_volume: Number,
              small_parcels_weight: Number,
              small_parcels_dwell_time: Number,
              small_parcels_cost: Number,
              num_of_medium_parcels: Number,
              medium_parcels_volume: Number,
              medium_parcels_weight: Number,
              medium_parcels_dwell_time: Number,
              medium_parcels_cost: Number,
              num_of_large_parcels: Number,
              large_parcels_volume: Number,
              large_parcels_weight: Number,
              large_parcels_dwell_time: Number,
              large_parcels_cost: Number
            }
          ]
        }
      ],
      resources: [
        {
          network_type: String,
          mtr_postal_code: Number,
          mtr_capacity_m3: Number,
          manpower_type: String,
          fleet_type: Number,
          fleet_capacity_volume_cm3: Number,
          fleet_capacity_weight_kg: Number,
          delivery_hours: Number,
          cost_manpower: Number
        }
      ]
    }
  ],
  od_matrix: {
    od_name : {
    fleet_type: Number,
    time_3wheel: Number,
    distance_3wheel: Number,
    time_2wheel: Number,
    distance_2wheel: Number,
    time_foot: Number,
    distance_foot: Number
    }
  }
});
const Sector = mongoose.model('Sector', sectorSchema);

const masterDataSchema = new Schema({
  title: String,
  sectors: { type: Schema.Types.ObjectId, ref: 'Sector' },
  projects: [
    {
      id: Number,
      name: String,
      sector: Number,
      beats: [Object],
      simulations: [
        {
          id: Number,
          scenario: Number,
          parameters: Object,
          input_data: Object,
          status: String,
          start_time: String,
          end_time: String,
          result: [
            {
              id: Number,
              data: Object,
              optimizations: [
                {
                  id: Number,
                  scenario: Number,
                  parameters: Object,
                  status: String,
                  start_time: String,
                  end_time: String,
                  results: {
                    data: { beats: [Object] }
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
});

const MasterData = mongoose.model('masterData', masterDataSchema);

// GraphQL type definitions
const typeDefs = `
  type MasterData {
    title: String
    sectors: Sector
    projects: Project
  }

  type Project {
    id: Int
    name: String
    sector: Int
    beats: [Beat]
    simulations: [Simulation]
  }

  type Simulation {
    id: Int
    scenario: Int
    parameters: Parameter
    input_data: InputData
    status: String
    start_time: String
    end_time: String
    result: [Result]
  }

  type Result {
    id: Int
    scenario: Int
    optimizations: Optimization
  }

  type Optimization {
    id: Int
    scenario: Int
    Parameters: Parameter
    status: String
    start_time: String
    end_time: String
    results: Results
  }
  
  type Results {
    data: [Data]
  }

  type Data {
    beats: [Beat]
  }
  
  type Sector {
    sector: Int
    od_matrix: odName
    beats: [Beat]
  }

  type Beat {
    beat_id: Int
    sequences: [Sequence]
    resources: [Resource]
  }

  type Sequence {
    seq_id: Int
    address: String
    postal_code: Int
    longitude: Float
    latitude: Float
    types: String
    unique_id: String
    num_of_units: Int
    shipments: [Shipment]
  }

  type Shipment {
    date: String
    num_of_mails: Int
    num_of_packets: Int
    bundles_volume: Float
    bundles_weight: Float
    bundles_dwell_time: Float
    num_of_small_parcels: Int
    small_parcels_volume: Float
    small_parcels_weight: Float
    small_parcels_dwell_time: Int
    small_parcels_cost: Int
    num_of_medium_parcels: Int
    medium_parcels_volume: Float
    medium_parcels_weight: Int
    medium_parcels_dwell_time: Int
    medium_parcels_cost: Int
    num_of_large_parcels: Int
    large_parcels_volume: Float
    large_parcels_weight: Int
    large_parcels_dwell_time: Int
    large_parcels_cost: Int
  }

  type Resource {
    network_type: String
    mtr_postal_code: Int
    mtr_capacity_m3: Int
    manpower_type: String
    fleet_type: Int
    fleet_capacity_volume_cm3: Int
    fleet_capacity_weight_kg: Int
    delivery_hours: Int
    cost_manpower: Int
  }

  type Matrix {
    fleet_type: Int
    time_3wheel: Int
    distance_3wheel: Int
    time_2wheel: Int
    distance_2wheel: Int
    time_foot: Int
    distance_foot: Int
    
  }
  type odName {
    entry(key: String): [Matrix]
  }

  type Parameter {
    parameter: String
  }

  type InputData {
    input_data: String
  }

  type Query {
    sectors: [Sector]
    masterdata: [MasterData]
  }
`;



// GraphQL resolvers
const resolvers = {
  Query: {
    masterdata: async () => {
      return await MasterData.find().populate('sectors');
    },
    sectors: async () => {
      return await Sector.find();
    },
  },
};



// Create an Apollo Server instance
const server = new ApolloServer<any>({ typeDefs, resolvers });

// Start the server
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);