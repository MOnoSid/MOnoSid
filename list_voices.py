import asyncio
import edge_tts

async def main():
    voices = await edge_tts.list_voices()
    for voice in voices:
        print(f"Name: {voice['Name']}")
        print(f"Language: {voice['Locale']}")
        print(f"Gender: {voice['Gender']}")
        print("-" * 50)

if __name__ == "__main__":
    asyncio.run(main())
