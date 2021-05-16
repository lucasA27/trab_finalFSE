#include <stdio.h>
#include <stdint.h>
#include <stddef.h>
#include <string.h>
#include "esp_system.h"
#include "esp_event.h"
#include "esp_netif.h"

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include "freertos/queue.h"

#include "lwip/sockets.h"
#include "lwip/dns.h"
#include "lwip/netdb.h"

#include "esp_log.h"
#include "mqtt_client.h"

#include "../include/mqtt.h"
#include "cJSON.h"
#include "../include/nvs.h"
#include "nvs.h"
#include "nvs_flash.h"

#define TAG "MQTT"
#define ENERGIA "ENERGY"
#define matricula 150018673

extern xSemaphoreHandle conexaoMQTTSemaphore;
extern xSemaphoreHandle conexaoRegistroSemaphore;

char _comodo[20]="comodo";

esp_mqtt_client_handle_t client;

char *get_mac_address()
{
    u_int8_t mac_address[6] = {0};
    int size = 25;
    char *mac = malloc(size);
    esp_efuse_mac_get_default(mac_address);
    snprintf(
        mac,
        size,
        "%x:%x:%x:%x:%x:%x",
        mac_address[0],
        mac_address[1],
        mac_address[2],
        mac_address[3],
        mac_address[4],
        mac_address[5]);
    ESP_LOGI(TAG, "MAC ADDRESS: [%s]", mac);
    return mac;
}


char *constroi_topico(char *option)
{
    int topic_size = 64;
    char *topic = malloc(topic_size);
    snprintf(topic, topic_size, "fse2020/%d/%s/%s", matricula, _comodo, option);
    return topic;
}

void mqtt_handle_data(int length, char *data)
{
    cJSON *body = cJSON_Parse(data);

    char *type = cJSON_GetObjectItem(body, "type")->valuestring;
    if (strcmp(type, "registrar") == 0)
    {
        memset(_comodo,0,sizeof(_comodo));
        strcpy(_comodo, cJSON_GetObjectItem(body, "comodo")->valuestring);
        grava_valor_nvs("comodo", _comodo);
        xSemaphoreGive(conexaoRegistroSemaphore);
    }

    if (strcmp(type, "apagarRegistro") == 0)
    {
        nvs_apaga();
        mqtt_conection();
    }
}

static esp_err_t mqtt_event_handler_cb(esp_mqtt_event_handle_t event)
{
    esp_mqtt_client_handle_t client = event->client;
    int msg_id;

    switch (event->event_id)
    {
    case MQTT_EVENT_CONNECTED:
        ESP_LOGI(TAG, "MQTT_EVENT_CONNECTED");
        xSemaphoreGive(conexaoMQTTSemaphore);
        msg_id = esp_mqtt_client_subscribe(client, "servidor/resposta", 0);
        break;
    case MQTT_EVENT_DISCONNECTED:
        ESP_LOGI(TAG, "MQTT_EVENT_DISCONNECTED");
        break;
    case MQTT_EVENT_SUBSCRIBED:
        ESP_LOGI(TAG, "MQTT_EVENT_SUBSCRIBED, msg_id=%d", event->msg_id);
        break;
    case MQTT_EVENT_UNSUBSCRIBED:
        ESP_LOGI(TAG, "MQTT_EVENT_UNSUBSCRIBED, msg_id=%d", event->msg_id);
        break;
    case MQTT_EVENT_PUBLISHED:
        ESP_LOGI(TAG, "MQTT_EVENT_PUBLISHED, msg_id=%d", event->msg_id);
        break;
    case MQTT_EVENT_DATA:
        ESP_LOGI(TAG, "MQTT_EVENT_DATA");
        mqtt_handle_data(event->data_len, event->data);
        //printf("TOPIC=%.*s\r\n", event->topic_len, event->topic);
        //printf("DATA=%.*s\r\n", event->data_len, event->data);
        break;
    case MQTT_EVENT_ERROR:
        ESP_LOGI(TAG, "MQTT_EVENT_ERROR");
        break;
    default:
        ESP_LOGI(TAG, "Other event id:%d", event->event_id);
        break;
    }
    return ESP_OK;
}

static void mqtt_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data)
{
    ESP_LOGD(TAG, "Event dispatched from event loop base=%s, event_id=%d", base, event_id);
    mqtt_event_handler_cb(event_data);
}

void mqtt_start()
{
    esp_mqtt_client_config_t mqtt_config = {
        .uri = "mqtt://test.mosquitto.org",
    };
    client = esp_mqtt_client_init(&mqtt_config);
    esp_mqtt_client_register_event(client, ESP_EVENT_ANY_ID, mqtt_event_handler, client);
    esp_mqtt_client_start(client);
}

void mqtt_conection()
{

    char *mac = malloc(25);
    mac = get_mac_address();

    char *macValue = le_valor_nvs("macValue");

  //  if (macValue == NULL || strlen(macValue) == 0)
   // {
        cJSON *conexao = cJSON_CreateObject();

        cJSON_AddStringToObject(conexao, "type", ENERGIA);
        cJSON_AddStringToObject(conexao, "mac", mac);

        char *json = cJSON_Print(conexao);

        char topico[64];
        snprintf(topico, 64, "fse2020/%d/dispositivos/%s", matricula, mac);

        mqtt_envia_mensagem(topico, json);
        grava_valor_nvs("macValue", mac);
        mqtt_recebe_message(topico);
    //}
   /* else
    {
        xSemaphoreGive(conexaoRegistroSemaphore);

        char topico[64];
        snprintf(topico, 64, "fse2020/%d/dispositivos/%s", matricula, mac);

        mqtt_recebe_message(topico);
    }*/
}

void mqtt_envia_mensagem(char *topico, char *mensagem)
{
    int message_id = esp_mqtt_client_publish(client, topico, mensagem, 0, 1, 0);
    ESP_LOGI(TAG, "Mesnagem enviada, ID: %d", message_id);
}

void mqtt_recebe_message(char *topico)
{
    esp_mqtt_client_subscribe(client, topico, 0);
}