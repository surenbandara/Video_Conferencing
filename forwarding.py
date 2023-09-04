from pyngrok import ngrok
ngrok_tunnel = ngrok.connect(3000)
print('Public URL:', ngrok_tunnel.public_url)