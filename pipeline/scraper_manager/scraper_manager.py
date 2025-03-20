import subprocess
import signal
import time

class ScraperManager():
    __scraper_paths: list[str]

    def __init__(self, scraper_paths):
        self.__scraper_paths = scraper_paths
    
    def scrape_for_interval(self, scrape_interval):
        processes = []
        signals = []
        try: 
            for script in self.__scraper_paths:
                process = subprocess.Popen(['python3', script], stdout=None, stderr=subprocess.DEVNULL)
                processes.append(process)
                signals.append(process.pid)
            
            time.sleep(scrape_interval)
            
            for process in processes:
                if process.poll() is None:
                    process.send_signal(signal.SIGINT)
            
            print('---- Scraping Ended ----')
        except Exception as e:
            print(e)
