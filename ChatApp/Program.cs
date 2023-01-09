using Microsoft.AspNetCore.SpaServices.AngularCli;
using System.Text.Json.Serialization;
using ChatApp.Extensions;
using ChatApp.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.BuildConfiguration(builder.Environment);

builder.Services.AddQueueClient(builder.Configuration);
builder.Services.AddTableClient(builder.Configuration);
builder.Services.AddCache(builder.Configuration);


builder.Services.AddSignalR(x => builder.Configuration.GetSection("UploadStatusHubOptions").Bind(x));

builder.Services.AddScoped<IChatHubService, ChatHubService>();
builder.Services.AddHostedService<ChatHostedService>();
builder.Services
    .AddMvc(opt => opt.EnableEndpointRouting = false);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

if (builder.Environment.IsDevelopment())
    builder.Services.AddSpaStaticFiles(configuration => { configuration.RootPath = "ClientApp"; });
else
    builder.Services.AddSpaStaticFiles(configuration => { configuration.RootPath = "ClientApp/dist"; });


builder.Services.AddSession();

var app = builder.Build();

app.UseAuthentication();

app.UseRouting();
app.UseCors("AllowAll");

app.UseAuthorization();


app.UseDeveloperExceptionPage();

app.UseHsts();


app.UseDefaultFiles();
app.UseStaticFiles();
app.UseSpaStaticFiles();

app.UseMvc();

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllerRoute("default", pattern: "{controller}/{action=Index}/{id?}");
    endpoints.MapHub<ChatHub>("/hub");
});

app.UseSpa(spa =>
{
    if (builder.Environment.IsDevelopment())
    {
        spa.Options.SourcePath = "ClientApp";
        spa.UseAngularCliServer(npmScript: "start");
    }
    else
    {
        spa.Options.SourcePath = "wwwroot/dist";
    }
});

app.Run();