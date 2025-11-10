# Fix Connection Timeout - Backend Network Access

## 🔴 Problem Found

Your backend is only listening on `127.0.0.1:8000` (localhost only), which means your phone can't reach it. It needs to listen on `0.0.0.0:8000` (all network interfaces).

## ✅ Solution

### Step 1: Restart Backend with Network Access

**Stop your current backend server** (Ctrl+C in the terminal where it's running), then restart it with:

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Important:** Notice the `--host 0.0.0.0` flag - this makes it accessible from your phone!

### Step 2: Allow Ports Through Windows Firewall

Run these commands in PowerShell **as Administrator**:

```powershell
# Allow backend port 8000
netsh advfirewall firewall add rule name="Backend Port 8000" dir=in action=allow protocol=TCP localport=8000

# Allow frontend port 5173
netsh advfirewall firewall add rule name="Frontend Port 5173" dir=in action=allow protocol=TCP localport=5173
```

**Or manually:**
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Select "TCP" and enter port `8000` → Next
6. Select "Allow the connection" → Next
7. Check all profiles → Next
8. Name it "Backend Port 8000" → Finish
9. Repeat for port `5173`

### Step 3: Verify Backend is Listening Correctly

After restarting, run this command to verify:

```powershell
netstat -an | findstr ":8000"
```

You should see:
```
TCP    0.0.0.0:8000         0.0.0.0:0              LISTENING
```

**NOT:**
```
TCP    127.0.0.1:8000         0.0.0.0:0              LISTENING  ❌
```

### Step 4: Test from Phone

1. **Test backend first:** `http://10.67.189.248:8000/`
   - Should show: `{"status":"ok","message":"Welcome..."}`
   
2. **Then test frontend:** `http://10.67.189.248:5173`
   - Should load your website

## Quick Checklist

- [ ] Backend restarted with `--host 0.0.0.0`
- [ ] Windows Firewall allows port 8000
- [ ] Windows Firewall allows port 5173
- [ ] Backend shows `0.0.0.0:8000` in netstat
- [ ] Phone can access `http://10.67.189.248:8000/`
- [ ] Phone can access `http://10.67.189.248:5173`

## Alternative: Quick Firewall Test

If you want to test quickly without changing firewall rules, you can temporarily disable Windows Firewall (not recommended for long, but okay for testing):

1. Open Windows Security
2. Firewall & network protection
3. Turn off firewall for Private network (temporarily)

**Remember to turn it back on after testing!**

