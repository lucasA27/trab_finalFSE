#ifndef MQTT_H
#define MQTT_H

void mqtt_start();
void mqtt_conection();
void mqtt_envia_mensagem(char * topico, char * mensagem);
char *constroi_topico(char *option);
void mqtt_recebe_message(char *topico);

#endif
