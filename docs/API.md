# AgriConnect API Documentation

Base URL: `/api`  
Authentication: `Authorization: Bearer <JWT token>` (except public endpoints)

## Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login |
| POST | `/auth/register` | Self-register (farmer/buyer) |
| GET | `/auth/me` | Current user |
| PATCH | `/auth/profile` | Update profile |

## Farmers (Digital Profiling)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/farmers` | List with search, pagination |
| GET | `/farmers/:id` | Farmer detail |
| POST | `/farmers` | Register farmer (extended profile) |
| PUT | `/farmers/:id` | Update farmer |
| DELETE | `/farmers/:id` | Soft delete |
| GET | `/farmers/map?county=&crop=` | GIS map points |
| GET | `/farmers/export` | CSV export |
| POST | `/farmers/sync` | Offline batch sync |

**Extended fields:** `district`, `village`, `farm_ownership`, `irrigation_methods`, `production_history`, `cooperative_member`, `vsla_member`, `digital_readiness`, `preferred_comm_channel`

## Advisories (Extension Advisory)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/advisories?category=&search=&tag=` | List advisories |
| GET | `/advisories/:id` | Detail with comments |
| POST | `/advisories` | Create |
| PUT | `/advisories/:id` | Update |
| DELETE | `/advisories/:id` | Delete |
| POST | `/advisories/:id/comments` | Add comment |
| POST | `/advisories/:id/like` | Toggle like |
| POST | `/advisories/:id/bookmark` | Toggle bookmark |
| GET | `/advisories/bookmarks/mine` | User bookmarks |

## Knowledge Base
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/knowledge?type=&category=&search=` | FAQs, guides, video, audio, PDF |
| GET | `/knowledge/:id` | Resource detail |
| POST | `/knowledge` | Create (admin/officer) |

## Cooperatives & VSLA
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cooperatives?type=cooperative\|vsla` | List groups |
| GET | `/cooperatives/:id` | Detail with members, meetings, loans |
| POST | `/cooperatives` | Register group |
| POST | `/cooperatives/:id/members` | Add member |
| POST | `/cooperatives/:id/meetings` | Schedule meeting |
| POST | `/cooperatives/:id/announcements` | Post announcement |
| POST | `/cooperatives/:id/loans` | Track loan |
| POST | `/cooperatives/:id/savings` | Record savings |

## Directory (Buyers & Suppliers)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/directory?type=&county=&search=` | Search directory |
| GET | `/directory/map` | Map locations |
| GET | `/directory/:id` | Profile with reviews |
| POST | `/directory/:id/reviews` | Submit review |

## Market Intelligence
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/market-intel/demand` | Buyer demand |
| GET | `/market-intel/aggregation` | Aggregation schedules |
| GET | `/market-intel/quality` | Quality standards |
| GET | `/market-intel/opportunities` | Combined market opportunities |

## Global Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search?q=` | Search farmers, advisories, products, directory, cooperatives, prices, knowledge |

## Audit Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/audit` | Activity log (admin) |
| GET | `/audit/logins` | Login attempts (admin) |

## Channel Integrations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ussd` | USSD webhook (farmer reg, weather, prices, tips) |
| POST | `/whatsapp/webhook` | Inbound WhatsApp |
| POST | `/whatsapp/broadcast` | Outbound broadcast |
| POST | `/ivr/incoming` | IVR call handler |
| POST | `/ivr/menu` | IVR menu selection |

## CMS
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cms?type=&status=` | Content list |
| POST | `/cms` | Create content |
| PUT | `/cms/:id` | Update content |

## Roles
`super_admin`, `extension_officer`, `digital_champion`, `farmer`, `buyer`, `transporter`, `agro_dealer`, `financial_institution`, `government_officer`, `research_institution`, `cooperative_manager`, `vsla_leader`
