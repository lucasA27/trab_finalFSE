#include <stdio.h>
#include <string.h>
#include "esp_log.h"
#include "nvs.h"
#include "nvs_flash.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_system.h"

#define PARTICAO "PARTICAO_NVS"

char *le_valor_nvs(char *nome)
{
    ESP_ERROR_CHECK(nvs_flash_init());

    char *valor = malloc(30);
    size_t tamanho;

    nvs_handle particao_padrao_handle;

    esp_err_t res_nvs = nvs_open(PARTICAO, NVS_READONLY, &particao_padrao_handle);

    if (res_nvs == ESP_ERR_NVS_NOT_FOUND)
    {
        ESP_LOGE("NVS", "Namespace: %s, não encontrado", PARTICAO);
    }
    else
    {
        esp_err_t res = nvs_get_str(particao_padrao_handle, nome, valor, &tamanho);

        switch (res)
        {
        case ESP_OK:
            printf("Nome armazenado: %s\n", valor);
            break;
        case ESP_ERR_NOT_FOUND:
            ESP_LOGE("NVS", "Nome não encontrado");
            return -1;
        default:
            ESP_LOGE("NVS", "Erro ao acessar o NVS (%s)", esp_err_to_name(res));
            return -1;
            break;
        }

        nvs_close(particao_padrao_handle);
    }
    return valor;
}

void grava_valor_nvs(char *nome, char *valor)
{
    ESP_ERROR_CHECK(nvs_flash_init());

    nvs_handle particao_padrao_handle;

    esp_err_t res_nvs = nvs_open(PARTICAO, NVS_READWRITE, &particao_padrao_handle);

    if (res_nvs == ESP_ERR_NVS_NOT_FOUND)
    {
        ESP_LOGE("NVS", "Namespace: %s, não encontrado", PARTICAO);
    }

    esp_err_t res = nvs_set_str(particao_padrao_handle, nome, valor);

    if (res != ESP_OK)
    {
        ESP_LOGE("NVS", "Não foi possível escrever no NVS (%s)", esp_err_to_name(res));
    }
    nvs_commit(particao_padrao_handle);
    nvs_close(particao_padrao_handle);
}
