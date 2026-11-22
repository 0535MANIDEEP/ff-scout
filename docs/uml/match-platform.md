# Match Platform — UML

Class diagram for the current free-entry model (product truth: `SPEC.md`). Verified-pool entities (`VerificationProof`, `verified`, `rank`, `moderator`) are intentionally absent.

```mermaid
classDiagram
    direction LR

    class User {
        +String id
        +String email
        +String passwordHash
        +String displayName
        +UserType userType
        +Role role
        +String gameUid
        +String brRank
        +String csRank
        +String city
        +Boolean visibleToSponsors
        +String orgName
        +String orgType
        +String brandName
        +String contact
        +DateTime paidUntil
        +DateTime createdAt
        +DateTime updatedAt
    }

    class Match {
        +String id
        +String organizerId
        +String title
        +String mode
        +String gameType
        +String entry
        +String entryFee
        +String prize
        +String prizePool
        +String status
        +DateTime date
        +String city
        +Boolean online
        +Int slots
        +String contact
        +String notes
        +DateTime createdAt
    }

    class MatchEntry {
        +String id
        +String matchId
        +String playerId
        +DateTime createdAt
    }

    class WaitlistEntry {
        +String id
        +String email
        +String segment
        +String city
        +DateTime createdAt
    }

    class RateLimitEntry {
        +String id
        +String key
        +DateTime createdAt
    }

    class AuditLog {
        +String id
        +String userId
        +String action
        +String detail
        +DateTime createdAt
    }

    class Report {
        +String id
        +String matchId
        +String reporterId
        +String reason
        +DateTime createdAt
    }

    class UserType {
        <<enumeration>>
        player
        sponsor
        admin
    }

    class Role {
        <<enumeration>>
        rusher
        sniper
        support
        anchor
        lurker
    }

    User "1" --> "0..*" Match : posts
    User "1" --> "0..*" MatchEntry : joins
    Match "1" --> "0..*" MatchEntry : roster
    User "1" --> "0..*" Report : files
    Match "1" --> "0..*" Report : receives
    User "1" --> "0..*" AuditLog : acts
    User ..> UserType : has
    User ..> Role : plays
```

## Taxonomy (value sets)

| Field | Values |
|---|---|
| `Match.mode` | `casual` · `competitive` · `ranked` · `esports` |
| `Match.gameType` | `BR` · `CS` · `BR/CS` |
| `Match.entry` | `free` · `paid` |
| `Match.prize` | `none` · `pool` |
| `Match.status` | `open` · `closed` |
| `User.userType` | `player` · `organizer` · `sponsor` · `admin` |

`entryFee` / `prizePool` are **notes** (e.g. `₹50`), never amounts the platform collects.

## Relationships and rules

| Rule | Where enforced |
|---|---|
| One organizer posts many matches; a match belongs to one organizer | `Match.organizerId` |
| A player joins a match at most once | `@@unique([matchId, playerId])` on `MatchEntry` |
| Deleting a match removes its roster | `onDelete: Cascade` |
| A closed match accepts no joins | join action checks `Match.status` |
| A player reports a match at most once | `@@unique([matchId, reporterId])` on `Report` |
| The poster sees the roster (name, UID, email, ranks) | roster query scoped to `Match.organizerId` |
| Sponsor-facing profile fields are legacy and unused | no sponsor directory or export query exists |

## Object diagram (one instance of the flow)

```mermaid
classDiagram
    class organizer_User {
        id = "org_01"
        displayName = "Rajawadi Cyber Game Nite"
        userType = player
        orgName = "Rajawadi Cyber Game Nite"
    }
    class match_BR {
        id = "m_100"
        title = "Friday BR Squad Night"
        mode = casual
        gameType = BR
        entry = paid
        entryFee = "₹50"
        prize = pool
        prizePool = "₹2,000"
        status = open
        date = "2026-12-05T18:00"
        city = "India"
    }
    class player_User {
        id = "pl_07"
        displayName = "Aura_Hype_"
        userType = player
        gameUid = "100000001"
        brRank = "Gold"
        csRank = "Platinum"
        visibleToSponsors = true
    }
    class entry_join {
        id = "e_500"
        matchId = "m_100"
        playerId = "pl_07"
    }

    organizer_User "1" --> "1" match_BR : organizes
    player_User "1" --> "1" entry_join : joins
    match_BR "1" --> "1" entry_join : roster
```
