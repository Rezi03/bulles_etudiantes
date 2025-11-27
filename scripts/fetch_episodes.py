import feedparser
import json
import os
from datetime import datetime

# URL du flux RSS de RCF
RSS_URL = "https://www.rcf.fr/feed/show/2934"

# Dossier de sortie pour le fichier JSON (dans assets/data)
OUTPUT_DIR = "assets/data"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "episodes.json")

def fetch_episodes():
    print(f"Récupération du flux : {RSS_URL}")
    feed = feedparser.parse(RSS_URL)

    if feed.bozo:
        print("Erreur lors du parsing du flux RSS")
        return

    episodes_data = []

    # On récupère les 10 derniers épisodes pour être sûr d'en avoir assez
    for entry in feed.entries[:10]:
        # Nettoyage et formatage des données
        episode = {
            "title": entry.title,
            "link": entry.link,
            "pubDate": entry.published, # Format brut, le JS le formatera
            "audioUrl": "",
            "description": entry.summary if 'summary' in entry else ""
        }

        # Trouver le lien mp3 (enclosure)
        for link in entry.links:
            if link.rel == 'enclosure':
                episode["audioUrl"] = link.href
                break
        
        episodes_data.append(episode)

    # Créer le dossier s'il n'existe pas
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    # Sauvegarder en JSON
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump({"status": "ok", "items": episodes_data, "updated": str(datetime.now())}, f, ensure_ascii=False, indent=2)
    
    print(f"Succès ! {len(episodes_data)} épisodes sauvegardés dans {OUTPUT_FILE}")

if __name__ == "__main__":
    fetch_episodes()