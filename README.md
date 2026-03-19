# SaveTheShip - 3D Multiplayer Game

A real-time multiplayer 3D game where 2-5 players navigate an FBX ship model in first-person view using WebSocket communication.

## Project Structure

```
SaveTheShip/
├── backend/
│   ├── server.js           # Node.js WebSocket server
│   └── package.json        # Dependencies
├── frontend/
│   ├── index.html          # Game UI
│   ├── game.js             # Vite entry point
│   ├── styles.css          # Styling
│   ├── vite.config.js      # Build configuration
│   ├── package.json        # Dependencies
│   ├── public/             # Static assets (models, textures)
│   └── src/
│       ├── core/           # Main game engine
│       ├── scene/          # 3D scene setup
│       ├── camera/         # Camera controls
│       ├── player/         # Player and character logic
│       ├── animation/      # Animation management
│       ├── loaders/        # FBX loader
│       └── networking/     # WebSocket communication
└── README.md
```

## Phase 1 & 2: 3D Game with Multiplayer

### Prerequisites
- Node.js (v14 or higher)
- npm

### Setup & Run Locally

1. **Install backend dependencies:**
```bash
cd backend
npm install
```

2. **Install frontend dependencies:**
```bash
cd frontend
npm install
```

3. **Start the backend server:**
```bash
cd backend
npm start
```
The server will run on `ws://localhost:8080`

4. **Start the frontend dev server:**
```bash
cd frontend
npm run dev
```
Opens on `http://localhost:5173` (Vite default)

5. **Test with multiple players:**
- Open the game in multiple browser windows/tabs
- Use Arrow Keys or WASD to move your character
- Use Space to jump
- Mouse to look around
- Watch 3D multiplayer synchronization in real-time

### Game Features Implemented

✅ 3D First-Person Camera with FPS controls
✅ FBX Model Loading (character animations)
✅ Character Animations (Idle, Run)
✅ Raycasting-based Ground Collision
✅ Real-time Position & Animation Synchronization
✅ Multi-player rendering (2-5 players per game)
✅ Keyboard controls (Arrow Keys / WASD / Space / Mouse)
✅ Handheld Flashlight Spotlight
✅ Player name labels above characters
✅ Live player list
✅ Connection status indicator

---

## Technical Details

### 3D Engine: Three.js
- WebGL-based 3D graphics rendering
- Real-time lighting with spotlight
- Shadow mapping for depth

### Collision Detection
- Raycasting for ground detection
- Character height offset calculation
- Dynamic mesh collection from FBX models

### Character System
- FBX model animation blending
- Skeleton-based animation playback
- Per-player color customization via bone influence
- Automatic Idle/Run animation switching based on movement

### Networking
- WebSocket real-time communication
- Game state synchronization every frame
- Player position, rotation, and animation state broadcasting

---

## Phase 3: AWS Deployment (Step-by-Step)

### Step 1: Prepare Your Code for AWS

1. Create a `.gitignore` file in the project root:
```
node_modules/
.DS_Store
```

2. Update the frontend WebSocket URL in `frontend/game.js`:
   - Line 32: The code already handles this automatically. It detects localhost for development and uses the hostname for production.

### Step 2: Create AWS Account & EC2 Instance

1. **Go to AWS Console:**
   - Visit https://aws.amazon.com
   - Sign in or create an account

2. **Navigate to EC2:**
   - Search for "EC2" in the search bar
   - Click "EC2" under "Services"

3. **Launch a new instance:**
   - Click "Instances" (left sidebar)
   - Click "Launch instances" button
   - Choose an AMI: Select **Ubuntu Server 22.04 LTS** (free tier eligible)
   - Instance type: **t2.micro** (free tier)
   - Click "Review and Launch"

4. **Configure security group:**
   - Before launching, click "Edit security groups"
   - Add these inbound rules:
     - Type: **SSH**, Port: **22**, Source: **Anywhere** (0.0.0.0/0)
     - Type: **Custom TCP**, Port: **8080**, Source: **Anywhere** (0.0.0.0/0)
     - Type: **HTTP**, Port: **80**, Source: **Anywhere**
     - Type: **HTTPS**, Port: **443**, Source: **Anywhere**

5. **Create or select a key pair:**
   - Create new: Enter a name like "game-server-key"
   - Download the `.pem` file (save it securely!)
   - Click "Launch instances"

6. **Get the instance details:**
   - Go to Instances page
   - Copy the **Public IPv4 address** (e.g., `54.123.45.67`)

### Step 3: Connect to Your EC2 Instance

**On Windows (using PowerShell or Command Prompt):**

1. Navigate to where you saved the `.pem` file:
```powershell
cd C:\Users\YourUsername\Downloads
```

2. Set permissions (Windows PowerShell as Admin):
```powershell
icacls "game-server-key.pem" /grant:r "$env:USERNAME":"(F)"
icacls "game-server-key.pem" /inheritance:r
```

3. SSH into the instance:
```powershell
ssh -i "game-server-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```
Replace `YOUR_EC2_PUBLIC_IP` with your instance's public IP address

### Step 4: Install Node.js on EC2

Once connected via SSH:

```bash
# Update package manager
sudo apt update
sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 5: Upload Your Code to EC2

**From your local machine (in PowerShell/Command Prompt):**

First, build the frontend:
```bash
cd frontend
npm run build
```

Then upload:
```bash
# Create folder on EC2
ssh -i "game-server-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP "mkdir -p /home/ubuntu/game"

# Upload backend
scp -i "game-server-key.pem" -r "C:\path\to\backend" ubuntu@YOUR_EC2_PUBLIC_IP:/home/ubuntu/game/

# Upload built frontend
scp -i "game-server-key.pem" -r "C:\path\to\frontend\dist" ubuntu@YOUR_EC2_PUBLIC_IP:/home/ubuntu/game/frontend-dist/
```

### Step 6: Start the Server on EC2

1. SSH back into EC2:
```bash
ssh -i a01489105.pem ubuntu@34.219.157.125
```

2. Install dependencies and start server:
```bash
cd /home/ubuntu/game/backend
npm install
npm start
```

The server should show:
```
Game server running on port 8080
WebSocket endpoint: ws://localhost:8080
```

3. Keep this terminal open, or run in background:
```bash
nohup npm start > server.log 2>&1 &
```

### Step 7: Serve Frontend on EC2

1. In another SSH terminal, serve the built frontend:
```bash
cd /home/ubuntu/game/frontend-dist
sudo npm install -g http-server
http-server -p 80
```

Or use Python:
```bash
cd /home/ubuntu/game/frontend-dist
sudo python3 -m http.server 80
```

### Step 8: Update Frontend for AWS

Since the frontend loads from EC2, it needs to connect to the WebSocket on the same server.

No changes needed! The `game.js` automatically detects the hostname and uses it for WebSocket connections.

### Step 9: Access Your Game

Open in browser:
```
http://YOUR_EC2_PUBLIC_IP
```

Invite friends, share the URL, and play!

---

## Making Server Persistent

To keep your server running after SSH disconnect:

**Option 1: Using nohup (simple)**
```bash
cd /home/ubuntu/game/backend
nohup npm start > server.log 2>&1 &
```

**Option 2: Using PM2 (recommended)**
```bash
npm install -g pm2
pm2 start npm --name "game-server" -- start
pm2 startup
pm2 save
```

---

## Monitoring & Troubleshooting

**Check if server is running:**
```bash
curl http://localhost:8080
```

**View server logs:**
```bash
cat /home/ubuntu/game/backend/server.log
```

**Kill a port:**
```bash
sudo lsof -ti:8080 | xargs kill -9
```

---

## Cost Estimation

- **EC2 t2.micro**: ~$9.50/month or free (first 12 months for new AWS accounts)
- **Data transfer**: Minimal for this game
- **Total**: Essentially free in first year with AWS free tier

---

## Next Steps (Phase 4 - Optional)

- Add more FBX character models
- Implement player emotes/gestures
- Add voice chat using WebRTC
- Implement a mission/objective system
- Add pickable items and inventory system
- Physics-based interactions
- Use DynamoDB for storing player progression
- Use CloudFront for CDN distribution of 3D assets
- Add SSL certificate (AWS Certificate Manager)
