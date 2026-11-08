// The desktop's own tests against the real EVLMG Server (upload, join while the uploader is offline, view-only keys,
// bad keys), run with the code this app ships. They skip unless EGD_SERVER_BIN points to the server binary.
import '@/core/collab/serverTransport.test'
