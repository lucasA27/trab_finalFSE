#include <stdio.h>
#include "nvs_flash.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "esp_http_client.h"
#include "esp_log.h"
#include "freertos/semphr.h"

#include "../include/wifi.h"
#include "../include/client.h"
#include "../include/mqtt.h"
#include "../include/dht11.h"
#include "../include/gpio.h"
#include "cJSON.h"
#include "nvs.h"


#define led 2
#define botao 0
#define time 2000
#define matricula 150018673

xSemaphoreHandle conexaoWifiSemaphore;
xSemaphoreHandle conexaoMQTTSemaphore;
xSemaphoreHandle conexaoRegistroSemaphore;

void conectadoWifi(void *params)
{
  while (true)
  {
    if (xSemaphoreTake(conexaoWifiSemaphore, portMAX_DELAY))
    {
      // Processamento Internet
      mqtt_start();
      //inicia conexao
      mqtt_conection();

      if (xSemaphoreTake(conexaoRegistroSemaphore, portMAX_DELAY))
      {
        configura_botao(botao);
        configura_led(led);
      }
    }
  }
}

void enviaDht11DataServidor(void *params)
{

  cJSON *data_temperature = cJSON_CreateObject();

  cJSON *data_humidity = cJSON_CreateObject();

  cJSON *data_status = cJSON_CreateObject();

  cJSON_AddStringToObject(data_temperature, "mac", get_mac_address());

  cJSON_AddStringToObject(data_humidity, "mac", get_mac_address());

  if (xSemaphoreTake(conexaoMQTTSemaphore, portMAX_DELAY))
  {
    while (true)
    {
      struct dht11_reading dht11 = DHT11_read();

      if (dht11.status >= 0)
      {

        cJSON_AddNumberToObject(data_temperature, "temperature", dht11.temperature);

        cJSON_AddNumberToObject(data_humidity, "humidity", dht11.humidity);

        cJSON_AddNumberToObject(data_status, "status", dht11.status);

        char *temp_json = cJSON_Print(data_temperature);

        char *hum_json = cJSON_Print(data_humidity);

        char *status_json = cJSON_Print(data_status);

        mqtt_envia_mensagem(constroi_topico("temperature"), temp_json);

        mqtt_envia_mensagem(constroi_topico("humidity"), hum_json);

        mqtt_envia_mensagem(constroi_topico("status"), status_json);

        cJSON_DeleteItemFromObject(data_temperature, "temperature");

        cJSON_DeleteItemFromObject(data_humidity, "humidity");

        cJSON_DeleteItemFromObject(data_status, "status");
      }
      vTaskDelay(time / portTICK_PERIOD_MS);
    }
  }
}

void app_main(void)
{
  // Inicializa o NVS
  esp_err_t ret = nvs_flash_init();
  DHT11_init(GPIO_NUM_4);
  if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND)
  {
    ESP_ERROR_CHECK(nvs_flash_erase());
    ret = nvs_flash_init();
  }
  ESP_ERROR_CHECK(ret);

  conexaoWifiSemaphore = xSemaphoreCreateBinary();
  conexaoMQTTSemaphore = xSemaphoreCreateBinary();
  conexaoRegistroSemaphore = xSemaphoreCreateBinary();

  wifi_start();

  xTaskCreate(&conectadoWifi, "Conexão ao MQTT", 4096, NULL, 1, NULL);
  xTaskCreate(&enviaDht11DataServidor, "Comunicação com Broker", 4096, NULL, 1, NULL);
}
