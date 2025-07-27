<template>
  <div class="p-4">
    <h2 class="text-xl font-bold">Bienvenue, {{ username || '...' }}</h2>

    <div v-if="!connected" class="space-y-2">
      <input v-model="usernameInput" placeholder="Entrez votre nom" class="border p-2 rounded" />
      <button @click="connect" class="bg-blue-600 text-white px-4 py-2 rounded">Se connecter</button>
    </div>

    <div v-else class="mt-4">
      <h3 class="font-semibold">Utilisateurs connectés :</h3>
      <ul>
        <li v-for="user in users" :key="user">
          {{ user }}
          <button v-if="user !== username" @click="startCall(user)" class="ml-2 text-sm text-blue-500">📞 Appeler</button>
        </li>
      </ul>

      <div class="mt-6 flex space-x-4">
        <video ref="localVideo" autoplay muted playsinline class="w-1/2 border rounded" />
        <video ref="remoteVideo" autoplay playsinline class="w-1/2 border rounded" />
      </div>

      <div v-if="incomingCall" class="mt-4 p-2 border rounded bg-yellow-100">
        <p>📲 Appel entrant de <strong>{{ incomingCaller }}</strong></p>
        <button @click="acceptCall" class="mr-2 bg-green-500 text-white px-2 py-1 rounded">Accepter</button>
        <button @click="rejectCall" class="bg-red-500 text-white px-2 py-1 rounded">Refuser</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const usernameInput = ref('')
const username = ref('')
const connected = ref(false)
const users = ref([])
const ws = ref(null)
const peer = ref(null)

const localStream = ref(null)
const remoteStream = ref(null)
const incomingCall = ref(false)
const incomingCaller = ref('')
const currentCallUser = ref('')

const localVideo = ref(null)
const remoteVideo = ref(null)

function connect() {
  if (!usernameInput.value) return

  ws.value = new WebSocket('ws://localhost:3001')
  ws.value.onopen = () => {
    ws.value.send(JSON.stringify({ type: 'login', name: usernameInput.value }))
  }

  ws.value.onmessage = async (event) => {
    const data = JSON.parse(event.data)

    switch (data.type) {
      case 'login':
        if (data.success) {
          username.value = usernameInput.value
          connected.value = true
          users.value = data.users.filter(u => u !== username.value)
          getLocalStream()
        } else {
          alert('Nom déjà utilisé')
        }
        break

      case 'new-user':
        if (!users.value.includes(data.name)) users.value.push(data.name)
        break

      case 'user-left':
        users.value = users.value.filter(u => u !== data.name)
        break

      case 'call':
        incomingCall.value = true
        incomingCaller.value = data.from
        break

      case 'accept':
        createPeerConnection()
        peer.value.setLocalDescription(await peer.value.createOffer())
        send({ type: 'offer', target: data.from, sdp: peer.value.localDescription })
        break

      case 'reject':
        alert(`${data.from} a rejeté l’appel`)
        closeCall()
        break

      case 'offer':
        createPeerConnection()
        await peer.value.setRemoteDescription(new RTCSessionDescription(data.sdp))
        const answer = await peer.value.createAnswer()
        await peer.value.setLocalDescription(answer)
        send({ type: 'answer', target: data.from, sdp: answer })
        break

      case 'answer':
        await peer.value.setRemoteDescription(new RTCSessionDescription(data.sdp))
        break

      case 'candidate':
        if (peer.value) {
          try {
            await peer.value.addIceCandidate(new RTCIceCandidate(data.candidate))
          } catch (e) {
            console.error('Erreur ICE :', e)
          }
        }
        break
    }
  }

  ws.value.onclose = () => {
    connected.value = false
    users.value = []
    alert('Déconnecté du serveur')
  }
}

function send(msg) {
  ws.value.send(JSON.stringify(msg))
}

function startCall(user) {
  currentCallUser.value = user
  send({ type: 'call', target: user })
}

function acceptCall() {
  send({ type: 'accept', target: incomingCaller.value })
  currentCallUser.value = incomingCaller.value
  incomingCall.value = false
}

function rejectCall() {
  send({ type: 'reject', target: incomingCaller.value })
  incomingCall.value = false
  incomingCaller.value = ''
}

function createPeerConnection() {
  peer.value = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })

  peer.value.onicecandidate = (event) => {
    if (event.candidate) {
      send({ type: 'candidate', target: currentCallUser.value, candidate: event.candidate })
    }
  }

  peer.value.ontrack = (event) => {
    remoteStream.value = event.streams[0]
    remoteVideo.value.srcObject = remoteStream.value
  }

  localStream.value.getTracks().forEach(track => {
    peer.value.addTrack(track, localStream.value)
  })
}

async function getLocalStream() {
  localStream.value = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  localVideo.value.srcObject = localStream.value
}

function closeCall() {
  if (peer.value) {
    peer.value.close()
    peer.value = null
  }
  remoteVideo.value.srcObject = null
}
</script>

<style scoped>
video {
  max-height: 300px;
}
</style>
