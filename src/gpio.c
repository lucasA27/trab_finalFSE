#include <stdio.h>
#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"
#include "esp_log.h"
#include "driver/gpio.h"

#include "../include/gpio.h"

xQueueHandle filaDeInterrupcao;

static void IRAM_ATTR gpio_isr_handler(void *args)
{
  int pino = (int)args;
  xQueueSendFromISR(filaDeInterrupcao, &pino, NULL);
}

void trataInterrupcaoBotao(void *params)
{
  int pino;
  int contador = 0;

  while(true)
  {
    if(xQueueReceive(filaDeInterrupcao, &pino, portMAX_DELAY))
    {
      // De-bouncing
      int estado = gpio_get_level(pino);
      if(estado == 1)
      {
        gpio_isr_handler_remove(pino);
        while(gpio_get_level(pino) == estado)
        {
          vTaskDelay(50 / portTICK_PERIOD_MS);
        }

        contador++;
        printf("Os botões foram acionados %d vezes. Botão: %d\n", contador, pino);

        // Habilitar novamente a interrupção
        vTaskDelay(50 / portTICK_PERIOD_MS);
        gpio_isr_handler_add(pino, gpio_isr_handler, (void *) pino);
      }

    }
  }
}

void configura_led(int led)
{
  // Configuração dos pinos dos LEDs 
  gpio_pad_select_gpio(led);   
  // Configura os pinos dos LEDs como Output
  gpio_set_direction(led, GPIO_MODE_OUTPUT);  

}

void configura_botao(int botao){
  // Configuração do pino do Botão
  gpio_pad_select_gpio(botao);
  // Configura o pino do Botão como Entrada
  gpio_set_direction(botao, GPIO_MODE_INPUT);
  // Configura o resistor de Pulldown para o botão (por padrão a entrada estará em Zero)
  gpio_pulldown_en(botao);
  // Desabilita o resistor de Pull-up por segurança.
  gpio_pullup_dis(botao);

  // Configura pino para interrupção
  gpio_set_intr_type(botao, GPIO_INTR_POSEDGE);

  filaDeInterrupcao = xQueueCreate(10, sizeof(int));
  xTaskCreate(trataInterrupcaoBotao, "TrataBotao", 2048, NULL, 1, NULL);

  gpio_install_isr_service(0);
  gpio_isr_handler_add(botao, gpio_isr_handler, (void *) botao);
  gpio_isr_handler_add(botao, gpio_isr_handler, (void *) botao);

}
